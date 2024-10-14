const faunadb = require('faunadb');
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });
const q = faunadb.query;

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }

    const { username } = JSON.parse(event.body);

    try {
        const userData = await client.query(
            q.Get(q.Match(q.Index('clicks_by_username'), username))
        );

        const updatedClicks = userData.data.clicks + 1;

        await client.query(
            q.Update(userData.ref, { data: { clicks: updatedClicks } })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ clicks: updatedClicks }),
        };
    } catch (error) {
        if (error.message.includes("not found")) {
            const result = await client.query(
                q.Create(q.Collection('clicks'), {
                    data: { username, clicks: 1 },
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
