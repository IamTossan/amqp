import { taskEither as TE, task as T } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { closeChannel, closeConnection, connect, createChannel } from './utils';
import { QUEUE_URL } from './constants';

const msg = { value: process.argv[2] };

const run = async () => {
    await pipe(
        TE.bindTo('connection')(connect(QUEUE_URL)),
        TE.bind('channel', ({ connection }) => createChannel(connection)),
        TE.chainFirstIOK(({ channel }) =>
            TE.of(
                channel.sendToQueue('jobs', Buffer.from(JSON.stringify(msg))),
            ),
        ),
        TE.chainFirst(({ channel }) => closeChannel(channel)),
        TE.chainFirst(({ connection }) => closeConnection(connection)),
        TE.fold(
            (e) => T.of(e.message),
            () => T.of(`Job sent successfully ${msg.value}`),
        ),
    )().then(console.log);
};

run();
