/**
 * gRPC サーバー実装
 *
 * このファイルでは gRPC の4つの通信パターンすべてを実装しています。
 * 各ハンドラには詳細な日本語コメントを付けて、動作原理を解説しています。
 */

import * as grpc from '@grpc/grpc-js';
import { MyServiceService, IMyServiceServer } from './generated/service_grpc_pb';
import {
  HelloRequest,
  HelloResponse,
  ListUsersRequest,
  UserResponse,
  ChatMessage,
  MessageSummary,
} from './generated/service_pb';

// =====================================================
// サンプルデータ（Server Streaming で使用）
// =====================================================
const sampleUsers = [
  { id: '1', name: '田中太郎', email: 'tanaka@example.com' },
  { id: '2', name: '鈴木花子', email: 'suzuki@example.com' },
  { id: '3', name: '佐藤一郎', email: 'sato@example.com' },
  { id: '4', name: '高橋美咲', email: 'takahashi@example.com' },
  { id: '5', name: '伊藤健太', email: 'ito@example.com' },
];

// =====================================================
// gRPC サービス実装
// =====================================================
const myServiceImpl: IMyServiceServer = {
  /**
   * 1. Unary RPC（単項RPC）
   *
   * 【動作原理】
   * - クライアントが1つのリクエストを送信
   * - サーバーが1つのレスポンスを返す
   * - HTTP の GET/POST リクエストに最も近い形式
   *
   * 【使いどころ】
   * - 単純なデータ取得・更新
   * - 認証・ログイン処理
   * - 設定値の取得など
   *
   * 【シグネチャ】
   * handleUnaryCall<Request, Response>
   *   - call.request: リクエストメッセージ
   *   - callback: レスポンスを返すためのコールバック
   */
  sayHello: (
    call: grpc.ServerUnaryCall<HelloRequest, HelloResponse>,
    callback: grpc.sendUnaryData<HelloResponse>
  ) => {
    console.log('[Unary] SayHello が呼び出されました');

    // リクエストからデータを取得
    const name = call.request.getName();
    console.log(`[Unary] 受信した名前: ${name}`);

    // レスポンスを作成
    const response = new HelloResponse();
    response.setMessage(`こんにちは、${name}さん！gRPC の世界へようこそ！`);

    // コールバックでレスポンスを返す
    // 第1引数: エラー（成功時は null）
    // 第2引数: レスポンスメッセージ
    callback(null, response);
    console.log('[Unary] レスポンスを送信しました\n');
  },

  /**
   * 2. Server Streaming RPC（サーバーストリーミング）
   *
   * 【動作原理】
   * - クライアントが1つのリクエストを送信
   * - サーバーが複数のレスポンスを順次送信
   * - サーバーが call.end() を呼ぶとストリーム終了
   *
   * 【使いどころ】
   * - 大量データの段階的な配信（ページネーション不要）
   * - リアルタイム通知・イベント配信
   * - ファイルダウンロード（チャンク送信）
   *
   * 【シグネチャ】
   * handleServerStreamingCall<Request, Response>
   *   - call.request: リクエストメッセージ
   *   - call.write(): レスポンスを1つ送信
   *   - call.end(): ストリーム終了
   */
  listUsers: (
    call: grpc.ServerWritableStream<ListUsersRequest, UserResponse>
  ) => {
    console.log('[Server Streaming] ListUsers が呼び出されました');

    const maxResults = call.request.getMaxResults() || sampleUsers.length;
    console.log(`[Server Streaming] 最大取得数: ${maxResults}`);

    // ユーザーを1人ずつ送信（実際のアプリではDBクエリ結果を逐次送信など）
    const usersToSend = sampleUsers.slice(0, maxResults);
    let index = 0;

    // 500ms 間隔でデータを送信（ストリーミングの様子を可視化）
    const intervalId = setInterval(() => {
      if (index >= usersToSend.length) {
        clearInterval(intervalId);
        call.end(); // ストリーム終了
        console.log('[Server Streaming] ストリーム終了\n');
        return;
      }

      const user = usersToSend[index];
      const response = new UserResponse();
      response.setId(user.id);
      response.setName(user.name);
      response.setEmail(user.email);

      call.write(response); // 1つのレスポンスを送信
      console.log(`[Server Streaming] 送信: ${user.name}`);
      index++;
    }, 500);
  },

  /**
   * 3. Client Streaming RPC（クライアントストリーミング）
   *
   * 【動作原理】
   * - クライアントが複数のリクエストを順次送信
   * - サーバーは全てのリクエストを受信後、1つのレスポンスを返す
   * - クライアントが送信完了すると 'end' イベントが発火
   *
   * 【使いどころ】
   * - ファイルアップロード（チャンク送信）
   * - バッチデータの送信
   * - センサーデータの集約
   *
   * 【シグネチャ】
   * handleClientStreamingCall<Request, Response>
   *   - call.on('data'): リクエストを1つ受信するたびに発火
   *   - call.on('end'): クライアントが送信完了した時に発火
   *   - callback(): レスポンスを返す
   */
  recordMessages: (
    call: grpc.ServerReadableStream<ChatMessage, MessageSummary>,
    callback: grpc.sendUnaryData<MessageSummary>
  ) => {
    console.log('[Client Streaming] RecordMessages が呼び出されました');

    const messages: string[] = [];

    // 'data' イベント: クライアントからメッセージを受信するたびに発火
    call.on('data', (message: ChatMessage) => {
      const user = message.getUser();
      const text = message.getText();
      messages.push(`${user}: ${text}`);
      console.log(`[Client Streaming] 受信: ${user} - "${text}"`);
    });

    // 'end' イベント: クライアントが送信を完了した時に発火
    call.on('end', () => {
      console.log('[Client Streaming] クライアントの送信が完了');

      // 集計結果をレスポンスとして返す
      const summary = new MessageSummary();
      summary.setMessageCount(messages.length);
      summary.setSummary(
        messages.length > 0
          ? `受信したメッセージ:\n${messages.join('\n')}`
          : 'メッセージは受信されませんでした'
      );

      callback(null, summary);
      console.log('[Client Streaming] サマリーを送信しました\n');
    });
  },

  /**
   * 4. Bidirectional Streaming RPC（双方向ストリーミング）
   *
   * 【動作原理】
   * - クライアントとサーバーが独立して複数のメッセージを送受信
   * - 両者は非同期に通信でき、順序に依存しない
   * - リアルタイムの双方向通信が可能
   *
   * 【使いどころ】
   * - リアルタイムチャット
   * - オンラインゲームの通信
   * - 協調編集（Google Docs のような）
   * - 株価などのリアルタイムデータ配信 + クライアントからの購読変更
   *
   * 【シグネチャ】
   * handleBidiStreamingCall<Request, Response>
   *   - call.on('data'): クライアントからメッセージを受信
   *   - call.write(): クライアントにメッセージを送信
   *   - call.on('end'): クライアントが送信終了
   *   - call.end(): サーバーが送信終了
   */
  chat: (
    call: grpc.ServerDuplexStream<ChatMessage, ChatMessage>
  ) => {
    console.log('[Bidirectional] Chat が開始されました');

    // クライアントからメッセージを受信するたびに発火
    call.on('data', (message: ChatMessage) => {
      const user = message.getUser();
      const text = message.getText();
      console.log(`[Bidirectional] 受信: ${user} - "${text}"`);

      // エコーバック + サーバーからの応答を送信
      const response = new ChatMessage();
      response.setUser('サーバー');
      response.setText(`「${text}」を受け取りました！`);

      call.write(response);
      console.log(`[Bidirectional] 送信: サーバー - "${response.getText()}"`);
    });

    // クライアントが送信を終了した時
    call.on('end', () => {
      console.log('[Bidirectional] クライアントが切断しました');

      // 最後のメッセージを送信
      const farewell = new ChatMessage();
      farewell.setUser('サーバー');
      farewell.setText('チャットを終了します。またお会いしましょう！');
      call.write(farewell);

      call.end(); // サーバー側もストリームを終了
      console.log('[Bidirectional] ストリーム終了\n');
    });
  },
};

// =====================================================
// サーバー起動
// =====================================================
function main() {
  const server = new grpc.Server();

  // サービスを登録
  server.addService(MyServiceService, myServiceImpl);

  const address = '0.0.0.0:50051';

  // サーバーをバインドして起動
  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(), // 開発用（本番では TLS を使用）
    (error, port) => {
      if (error) {
        console.error('サーバー起動エラー:', error);
        return;
      }
      console.log('='.repeat(50));
      console.log('gRPC サーバーが起動しました');
      console.log(`アドレス: ${address}`);
      console.log('='.repeat(50));
      console.log('\n待機中... (Ctrl+C で終了)\n');
    }
  );
}

main();
