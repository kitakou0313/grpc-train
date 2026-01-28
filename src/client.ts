/**
 * gRPC クライアント実装
 *
 * このファイルでは gRPC の4つの通信パターンすべてを呼び出すデモクライアントです。
 * 各パターンの使い方と特徴を日本語コメントで解説しています。
 */

import * as grpc from '@grpc/grpc-js';
import { MyServiceClient } from './generated/service_grpc_pb';
import {
  HelloRequest,
  ListUsersRequest,
  ChatMessage,
} from './generated/service_pb';

// サーバーに接続
const client = new MyServiceClient(
  'localhost:50051',
  grpc.credentials.createInsecure() // 開発用（本番では TLS を使用）
);

// =====================================================
// ユーティリティ関数
// =====================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printSeparator(title: string) {
  console.log('\n' + '='.repeat(50));
  console.log(title);
  console.log('='.repeat(50) + '\n');
}

// =====================================================
// 1. Unary RPC デモ
// =====================================================

/**
 * Unary RPC（単項RPC）の呼び出し例
 *
 * 【特徴】
 * - 最もシンプルな通信パターン
 * - 1リクエスト → 1レスポンス
 * - Promise でラップすると async/await が使える
 *
 * 【クライアント側の実装ポイント】
 * - リクエストメッセージを作成
 * - コールバック関数でレスポンスを受け取る
 */
async function demoUnaryRPC(): Promise<void> {
  printSeparator('1. Unary RPC（単項RPC）デモ');

  return new Promise((resolve, reject) => {
    // リクエストを作成
    const request = new HelloRequest();
    request.setName('gRPC学習者');

    console.log('リクエスト送信: name =', request.getName());

    // RPC 呼び出し
    client.sayHello(request, (error, response) => {
      if (error) {
        console.error('エラー:', error.message);
        reject(error);
        return;
      }

      console.log('レスポンス受信:', response.getMessage());
      resolve();
    });
  });
}

// =====================================================
// 2. Server Streaming RPC デモ
// =====================================================

/**
 * Server Streaming RPC（サーバーストリーミング）の呼び出し例
 *
 * 【特徴】
 * - 1リクエスト → 複数レスポンス
 * - サーバーが好きなタイミングでデータを送信できる
 * - クライアントは ReadableStream としてデータを受信
 *
 * 【クライアント側の実装ポイント】
 * - stream.on('data'): データを1つ受信するたびに発火
 * - stream.on('end'): サーバーがストリームを終了した時に発火
 * - stream.on('error'): エラー発生時に発火
 */
async function demoServerStreamingRPC(): Promise<void> {
  printSeparator('2. Server Streaming RPC（サーバーストリーミング）デモ');

  return new Promise((resolve, reject) => {
    // リクエストを作成
    const request = new ListUsersRequest();
    request.setMaxResults(3); // 3人まで取得

    console.log('リクエスト送信: maxResults =', request.getMaxResults());
    console.log('ストリーミング受信開始...\n');

    // Server Streaming の呼び出し - 戻り値は ReadableStream
    const stream = client.listUsers(request);

    // 'data' イベント: サーバーからデータを受信するたびに発火
    stream.on('data', (user) => {
      console.log('ユーザー受信:', {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
      });
    });

    // 'end' イベント: サーバーがストリームを終了した時に発火
    stream.on('end', () => {
      console.log('\nストリーミング完了');
      resolve();
    });

    // 'error' イベント: エラー発生時に発火
    stream.on('error', (error) => {
      console.error('エラー:', error.message);
      reject(error);
    });
  });
}

// =====================================================
// 3. Client Streaming RPC デモ
// =====================================================

/**
 * Client Streaming RPC（クライアントストリーミング）の呼び出し例
 *
 * 【特徴】
 * - 複数リクエスト → 1レスポンス
 * - クライアントが好きなタイミングでデータを送信できる
 * - サーバーは全データ受信後にレスポンスを返す
 *
 * 【クライアント側の実装ポイント】
 * - stream.write(): データを1つ送信
 * - stream.end(): 送信完了を通知
 * - コールバック関数でレスポンスを受け取る
 */
async function demoClientStreamingRPC(): Promise<void> {
  printSeparator('3. Client Streaming RPC（クライアントストリーミング）デモ');

  return new Promise((resolve, reject) => {
    console.log('ストリーミング送信開始...\n');

    // Client Streaming の呼び出し - 戻り値は WritableStream
    // コールバックでサーバーからの最終レスポンスを受け取る
    const stream = client.recordMessages((error, response) => {
      if (error) {
        console.error('エラー:', error.message);
        reject(error);
        return;
      }

      console.log('\nサーバーからのサマリー:');
      console.log('  メッセージ数:', response.getMessageCount());
      console.log('  内容:', response.getSummary());
      resolve();
    });

    // 複数のメッセージを送信
    const messages = [
      { user: 'Alice', text: 'こんにちは！' },
      { user: 'Bob', text: 'gRPC って便利ですね' },
      { user: 'Alice', text: 'ストリーミングが特に強力です' },
    ];

    // 非同期で順次送信（実際のアプリではユーザー入力など）
    let index = 0;
    const sendNext = () => {
      if (index >= messages.length) {
        stream.end(); // 送信完了を通知
        console.log('送信完了');
        return;
      }

      const msg = messages[index];
      const chatMessage = new ChatMessage();
      chatMessage.setUser(msg.user);
      chatMessage.setText(msg.text);

      stream.write(chatMessage);
      console.log(`送信: ${msg.user} - "${msg.text}"`);
      index++;
      setTimeout(sendNext, 300); // 300ms 間隔で送信
    };

    sendNext();
  });
}

// =====================================================
// 4. Bidirectional Streaming RPC デモ
// =====================================================

/**
 * Bidirectional Streaming RPC（双方向ストリーミング）の呼び出し例
 *
 * 【特徴】
 * - 複数リクエスト ↔ 複数レスポンス
 * - クライアントとサーバーが独立して送受信可能
 * - リアルタイム双方向通信に最適
 *
 * 【クライアント側の実装ポイント】
 * - stream.write(): サーバーにメッセージを送信
 * - stream.on('data'): サーバーからメッセージを受信
 * - stream.end(): クライアント側の送信終了
 * - stream.on('end'): サーバー側の送信終了
 */
async function demoBidirectionalStreamingRPC(): Promise<void> {
  printSeparator('4. Bidirectional Streaming RPC（双方向ストリーミング）デモ');

  return new Promise((resolve, reject) => {
    console.log('双方向チャット開始...\n');

    // Bidirectional Streaming の呼び出し - 戻り値は DuplexStream
    const stream = client.chat();

    // サーバーからのメッセージを受信
    stream.on('data', (message) => {
      console.log(`受信: ${message.getUser()} - "${message.getText()}"`);
    });

    // サーバーがストリームを終了した時
    stream.on('end', () => {
      console.log('\nチャット終了');
      resolve();
    });

    // エラー処理
    stream.on('error', (error) => {
      console.error('エラー:', error.message);
      reject(error);
    });

    // クライアントからメッセージを送信
    const messages = [
      'やあ、サーバーさん！',
      'gRPC の双方向ストリーミングを試しています',
      'これが最後のメッセージです',
    ];

    let index = 0;
    const sendNext = () => {
      if (index >= messages.length) {
        // 少し待ってからストリームを終了（サーバーの応答を待つ）
        setTimeout(() => {
          stream.end(); // クライアント側の送信終了
        }, 500);
        return;
      }

      const chatMessage = new ChatMessage();
      chatMessage.setUser('クライアント');
      chatMessage.setText(messages[index]);

      stream.write(chatMessage);
      console.log(`送信: クライアント - "${messages[index]}"`);
      index++;
      setTimeout(sendNext, 800); // 800ms 間隔で送信
    };

    sendNext();
  });
}

// =====================================================
// メイン処理
// =====================================================

async function main() {
  console.log('='.repeat(50));
  console.log('gRPC 4つの通信パターン デモクライアント');
  console.log('='.repeat(50));

  try {
    // 1. Unary RPC
    await demoUnaryRPC();
    await sleep(1000);

    // 2. Server Streaming RPC
    await demoServerStreamingRPC();
    await sleep(1000);

    // 3. Client Streaming RPC
    await demoClientStreamingRPC();
    await sleep(1000);

    // 4. Bidirectional Streaming RPC
    await demoBidirectionalStreamingRPC();

    console.log('\n' + '='.repeat(50));
    console.log('全てのデモが完了しました！');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    // クライアント接続を閉じる
    client.close();
  }
}

main();
