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

    const { username, clicks } = JSON.parse(event.body);

    try {
        const result = await client.query(
            q.Create(q.Collection('clicks'), {
                data: {
                    username,
                    clicks,
                },
            })
        );
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error saving data', error }),
        };
    }
};
