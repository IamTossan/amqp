import amqp from 'amqplib';

connect();
async function connect() {
    try {
        const amqpServer = 'amqp://localhost:5672';
        const connection = await amqp.connect(amqpServer);
        const channel = await connection.createChannel();
        await channel.assertQueue('jobs');

        channel.consume('jobs', (message) => {
            if (!message) {
                return;
            }
            const input = JSON.parse(message.content.toString());
            console.log(`Recieved job with input ${input.value}`);

            if (input.value === '7') channel.ack(message);
        });

        console.log('Waiting for messages...');
    } catch (ex) {
        console.error(ex);
    }
}
