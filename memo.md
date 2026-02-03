# gRPCとは
- Remote Procedure Callのフレームワークの一種
- Protocol Buffersを以下のように利用している
    - Client, Server間のインターフェース定義言語
    - シリアライズのフォーマット
    - デフォルトのInterface Definition Launguageとして利用している

## どこで策定されているか
- gRPC自体
    - CNCF
    - grpc.io
- Protocol BuffersはGoogle

## 他技術との関連
- HTTP2の上に構築されている

## プログラミング言語からの利用方法
### TypeScriptからの利用方法
- `@grpc/grpc-js`が現在主流
    - `grpc`はdepricated
    - docs 
        - https://grpc.github.io/grpc/node/grpc.html
        - `grpc`のものだが、ほぼ同じinterfaceなので参考にして良い（一部違いはあるのでgithubを見る）
- 動的に`.proto`から生成する場合
    - `@grpc/proto-loader`
    - コードの実行時に生成
- 静的に`.proto`から生成する場合
    - `grpc_tools_node_protoc_ts`
    - 事前に実装と型定義を生成
        - 基本はこっちにするべき
        - 動的生成はコンパイル時の方検証もできないため


# Protocol Buffersについて

## 公式のdocs
- https://protobuf.dev/
- `.proto`ファイルのspecificationなど
    - https://protobuf.dev/programming-guides/proto3/

## 概要
- serialization formatの一種
- 言語、プラットフォームに依存しない

## 具体的な運用
`.proto`でmessagesを定義する

```
syntax = "proto3";

message Person {
  string name = 1;
  int32 age = 2;
  string email = 3;
}
```

1,2,3というのはfield indentification（シリアライズの時のfieldを識別するため）であり、デフォルト値ではない

## JSONなどに対する優位性

### 効率的なシリアライズ
- JSON
    - 値自体 + field名、区切り文字などが送信される
- Protocol Buffers
    - 値自体 + field indentificationの数字

- でも送信元、送信先両方で同じ `.proto`ファイルがないといけないですよね？
    - field名や区切り文字を送信しない代わりに、事前にどの番号がどのfieldかを`.proto`ファイルの共有で取り決めることでシリアライズ後のデータ量や送受信するデータ量を削減している

### 堅安全性、効率性
- JSON
    - 各言語で値に変換するまでの流れ
        - Raw bytes → UTF-8 decoding → String parsing → Type inference → Object construction (オブジェクト構築)
    - この検証が実行時にしか行われない
        - 受信後、型の推論や検証を行う必要がある
- Protocol Buffers
    - 各言語で値に変換するまでの流れ
        - Raw bytes → Direct memory mapping → Object ready
    - どの値も型を持つため、コンパイル時に検証できる
        - スキーマが明示的に`.proto`ファイルで定義される
    - 直接メモリにマッピングできる

### 後方互換性
- Protocol Buffers
    - 新しいfieldを追加した際の挙動
    - 古いClientは自動で新しいfiledを無視する


# 用語の整理
- Message
    - データ構造の定義
- Service
    - Remote Procedure Callのinterface
    - 上で定義したmessageを使って定義できる