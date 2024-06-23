# ゲームのマルチプレイ相手を募集するサービス

※すでに公開を終了しています。対象としていたゲームのオンラインサービスが終了したこと、ホスティングしていたサービス（Heroku）の無料枠がなくなったこと、Twitter APIの仕様が変更されたことが理由です。

## ホーム画面
- 画像のように、自分または他のユーザーが立てたミーティングイベントが一覧で表示されます。
- 黄緑の四角部分にはミーティング作成者のTwitterのアイコンが、その右側にはアカウントのIDが表示されます。
- 左上のボタンで期間を絞り込んで表示することができます。

![ホーム画面](https://github.com/floppy73/meeting_organization_board/blob/main/images/main_menu.png)

## ミーティングの詳細
- ホーム画面でミーティングをクリックすると、詳細画面に移ります。
- 詳細画面では、そのミーティングに対して「行く！」「行くかも」の参加表明をすることができます。
- 参加表明の取り消しは「参加表明を取り消す」でいつでも行えます。

![詳細画面](https://github.com/floppy73/meeting_organization_board/blob/main/images/meeting.png)

## マルチプレイ相手の募集
- ホーム画面右下の+を押すと、新規にマルチプレイ相手を募集するミーティングを立てることができます。下のような画面に遷移します。
- 場所、時間、一言を入力して「ミーティングを作成」を押すと、新たなミーティングが作成され、他ユーザーからも見えるようになります。
- Twitterのフォロワー限定にしたい場合は、「フォロワー限定公開にする」にチェックを入れてください。
- Twitterにも投稿するにチェックをいれると、ミーティングの個別ページへのリンク付きでツイートする画面に移行します。

![新規作成画面](https://github.com/floppy73/meeting_organization_board/blob/main/images/new_event.png)
  
- 自分の作ったミーティングは、詳細画面で削除することができます。詳細画面最下部の「このミーティングを削除する」をクリックで削除します。
- 自分が作ったミーティングでも、自分の参加表明を取り消すことができます。すでに参加者が集まっている場合は、ミーティング削除ではなく参加表明取り消しがおすすめです。

![詳細画面（自分が作ったミーティング）](https://github.com/floppy73/meeting_organization_board/blob/main/images/meeting_self.png)
