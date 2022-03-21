import { taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { log } from 'fp-ts/lib/Console';

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
        TE.chainFirstIOK(() => log(`Job sent successfully ${msg.value}`)),
    )();
};

run();
