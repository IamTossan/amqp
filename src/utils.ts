import * as amqp from 'amqplib';
import { TaskEither, tryCatch } from 'fp-ts/TaskEither';

export const connect = (url: string): TaskEither<Error, amqp.Connection> => {
    return tryCatch(
        async () => amqp.connect(url),
        (reason) => new Error(String(reason)),
    );
};

export const createChannel = (
    connection: amqp.Connection,
): TaskEither<Error, amqp.Channel> => {
    return tryCatch(
        async () => connection.createChannel(),
        (reason) => new Error(String(reason)),
    );
};

export const closeChannel = (
    channel: amqp.Channel,
): TaskEither<Error, void> => {
    return tryCatch(
        async () => channel.close(),
        (reason) => new Error(String(reason)),
    );
};

export const closeConnection = (
    connection: amqp.Connection,
): TaskEither<Error, void> => {
    return tryCatch(
        async () => connection.close(),
        (reason) => new Error(String(reason)),
    );
};
