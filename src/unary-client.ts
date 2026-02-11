import * as grpc from '@grpc/grpc-js'
import { MyServiceClient } from './generated/service_grpc_pb';
import {
  HelloRequest,
  ListUsersRequest,
  ChatMessage,
} from './generated/service_pb';
import { resolve } from 'path';
import { error } from 'console';
import { constrainedMemory } from 'process';

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

// Client Streaming gRPC
// Client側が複数送信
async function demoClientStreamingRPC(client:MyServiceClient): Promise<void> {
    
    return new Promise((resolve, reject) => {
        console.log(`[Client] Client Streaming送信`)

        // Client Streamingの呼び出し
        // 戻り値がWritableStreamになり、callbackで最終レスポンスを受け取った時の処理を定義
        const stream = client.recordMessages((error, response) => {
            if(error) {
                console.error(`[Client] エラー:`, error.message)
                reject(error)
                return
            }

            console.log(`[Client] サーバーからのサマリー`, response.getSummary())
            resolve()
        })

        const messages = [
            {user: 'Alice', text: 'Hello!'},
            {user: 'Bob', text: 'Hello!2'},
            {user: 'Alice', text: 'Hello!3'},

        ]
        for (const message of messages) {
            const chatMessage = new ChatMessage()
            chatMessage.setUser(message.user)
            chatMessage.setText(message.text)

            stream.write(chatMessage)
            console.log(`[Client] 送信: ${chatMessage.getUser()} - ${chatMessage.getText()}`)
        }
    })
}

// Bidirectional Streaming RPC
async function demoBidirectionalStreamingRPC(client: MyServiceClient): Promise<void> {
    
    return new Promise((resolve, reject) => {
        console.log('[Client] 双方向チャット開始...\n');
        
        // 双方向Streaming用のstreamを取得
        const stream = client.chat()

        // Serverからのメッセージ受信時の処理
        // ハンドラを登録する形で受信時の処理を定義
        stream.on("data", (response) => {
            console.log(`[client]: 受信: ${response.getUser()} - ${response.getText()}`)
        })
        stream.on("end", () => {
            console.log('[Client] チャット終了')
            resolve()
        })
        stream.on("error", (error) => {
            console.error('[Client] エラー:', error.message)
            reject(error)
        })

        // Clientからのメッセージ送信時の処理
        const messages = [
            "Hello, Server! from Bidirectional Stream",
        ]
        for (const message of messages) {
            const chatMessage = new ChatMessage();
            chatMessage.setUser('ClientUser')
            chatMessage.setText(message)

            stream.write(chatMessage)
        }

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