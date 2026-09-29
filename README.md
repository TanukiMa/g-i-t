# g医t

GitHub Actions 上で定期実行し、日本の医療・薬事系サイトの変更を追跡するリポジトリです。

## 仕組み

- `.github/workflows/stalk.yml` が6時間ごとに実行され、`website-stalker.yaml` に列挙したサイトを巡回します。
- 変更が検出されると、変更されたファイルは自動でこのリポジトリにコミットされます。
- 変更内容は [`CHANGELOG.md`](CHANGELOG.md) に日時付きで追記され、あわせてコミットされます。
- 同じワークフロー内で GitHub Pages 用のページをビルドし、変更履歴レポートを公開します。

## 変更履歴レポート

最新の変更履歴は GitHub Pages で公開されています（リポジトリの Settings → Pages を有効化した後に URL が発行されます）。
生データは [`CHANGELOG.md`](CHANGELOG.md) をそのまま参照しても構いません。

## 手動実行

GitHub の Actions タブから `Stalk websites` ワークフローを `workflow_dispatch` で手動実行できます。

## ローカルでの追加・確認

```bash
# サイトを追加する場合は website-stalker.yaml を編集してから
website-stalker run --all
```
