import * as amqp from 'amqplib';
import { either, task, taskEither } from 'fp-ts';
import { TaskEither, tryCatch } from 'fp-ts/TaskEither';
import { flow, pipe } from 'fp-ts/function';

const msg = { number: process.argv[2] };

const connect = (url: string): TaskEither<Error, amqp.Connection> => {
    return tryCatch(
        () => Promise.resolve(amqp.connect(url)),
        (reason) => new Error(String(reason)),
    );
};

const createChannel = (
    connection: amqp.Connection,
): TaskEither<Error, amqp.Channel> => {
    return tryCatch(
        () => Promise.resolve(connection.createChannel()),
        (reason) => new Error(String(reason)),
    );
};

const closeChannel = (channel: amqp.Channel): TaskEither<Error, void> => {
    return tryCatch(
        async () => Promise.resolve(channel.close()),
        (reason) => new Error(String(reason)),
    );
};

const closeConnection = (
    connection: amqp.Connection,
): TaskEither<Error, void> => {
    return tryCatch(
        async () => Promise.resolve(connection.close()),
        (reason) => new Error(String(reason)),
    );
};

const run = async () => {
    const connection = pipe(
        taskEither.of('amqp://localhost:5672'),
        taskEither.chain(connect),
    );
    const channel = await pipe(
        connection,
        taskEither.chain(createChannel),
        taskEither.map((c) => {
            c.sendToQueue('jobs', Buffer.from(JSON.stringify(msg)));
            return c;
        }),
        taskEither.chain(closeChannel),
    )();

    const close = await pipe(
        connection,
        taskEither.chain(closeConnection),
        taskEither.map(() =>
            console.log(`Job sent successfully ${msg.number}`),
        ),
    )();

    // either.fold<Error, amqp.Connection, void>(console.error, async (c) => {
    //     await c.close();
    //     console.log(`Job sent successfully ${msg.number}`);
    // })(connection);
};

run();
