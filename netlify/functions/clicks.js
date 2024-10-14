const faunadb = require('faunadb');
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });
const q = faunadb.query;

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }

    // Get the user's IP address
    const userIP = context.clientContext.ip;

    try {
        // Check if the user already exists based on IP
        const userData = await client.query(
            q.Get(q.Match(q.Index('clicks_by_ip'), userIP))
        );

        // Increment the clicks count
        const updatedClicks = userData.data.clicks + 1;

        // Update the user's clicks in the database
        await client.query(
            q.Update(userData.ref, { data: { clicks: updatedClicks } })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ clicks: updatedClicks }),
        };
    } catch (error) {
        if (error.message.includes("not found")) {
            // User not found, create a new entry
            const result = await client.query(
                q.Create(q.Collection('clicks'), {
                    data: { ip: userIP, clicks: 1 },
                })
            );
            return {
                statusCode: 200,
                body: JSON.stringify({ clicks: 1 }), // First click
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error saving data', error }),
        };
    }
};
