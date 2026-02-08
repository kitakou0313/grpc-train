import * as grpc from '@grpc/grpc-js'
import { MyServiceClient } from './generated/service_grpc_pb';
import {
  HelloRequest,
  ListUsersRequest,
  ChatMessage,
} from './generated/service_pb';

function sleep(ms:number): Promise<void> {
    return new Promise(
        (resolve) => setTimeout(resolve, ms)
    )
}

async function demoUnaryGRPC(client: MyServiceClient): Promise<void> {
    
    return new Promise((resolve, reject) => {
        const request = new HelloRequest();
        request.setName(`test user`)

        client.sayHello(request, (error, response) => {
            if (error) {
                console.log('エラー:', error)
                reject(error)
            }

            console.log(`response message:`, response.getMessage())
            resolve()
        })
    })
}

// Server streaming
// 1リクエスト -> 複数のレスポンス -> 送信停止
// サーバーからの受信でイベントが発生するため、それに対応するハンドラを用意するイメージ
async function demoServerStreamingRPC(client: MyServiceClient): Promise<void> {
    console.log('[Client] Server Streaminig RPCß')

    return new Promise((resolve, reject) => {
        const request = new ListUsersRequest()
        request.setMaxResults(3)

        const call = client.listUsers(request)

        call.on('data', (response) => {
            console.log(`[Client] 受信: `, {
                id: response.getId(),
                name: response.getName(),
                email: response.getEmail()
            })
        })

        call.on('end', () => {
            console.log('[Client] 送信終了')
            resolve()
        })

        call.on('error', (error) => {
            console.log('[Client] エラー発生')
            reject(error)
        })
    })
}

async function main() {
    // サーバーに接続
    const client = new MyServiceClient(
        'localhost:50051',
        grpc.credentials.createInsecure() // 開発用（本番では TLS を使用）
    );

    try {
        await demoUnaryGRPC(client);
        await sleep(1000);

        await demoServerStreamingRPC(client)
        await sleep(1000);
    } finally {
        client.close();
    }
}

main()