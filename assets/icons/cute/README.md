# Icons8 "Cute Color" icons

All 50 icons are filled in and registered in `src/theme/cuteIcons.ts`
(source: https://icons8.com/icons/dusk--author-made-by-made). Most PNGs
here are 256×256 transparent images, downscaled from the original
1024×1024 exports to keep the app bundle small — plenty of headroom for
the ~28–44px sizes these render at on screen. The parent-mode batch below
is kept at the original 1024×1024 export size.

To replace one later: drop the new PNG in here under the same file name
(or update the `require()` path in `cuteIcons.ts` if the name changes).
Nothing else needs to change — every place in the app that shows an icon
renders through `<CuteIcon>`.

## Task icons
- `wash-face.png` — 顔を洗う
- `toothbrush.png` — 歯磨き
- `breakfast.png` — 朝ごはん
- `get-dressed.png` — 着替える
- `school-bag.png` — ランドセル確認
- `shoes.png` — 靴
- `toilet.png` — トイレ
- `pajamas.png` — パジャマ
- `homework.png` — 宿題
- `water-bottle.png` — 水筒
- `handkerchief.png` — ハンカチ
- `tomorrow-clothes.png` — 明日の服
- `bath.png` — お風呂
- `hair-dryer.png` — 髪を乾かす

## Menu icons
- `morning-prep.png` — 朝のおしたく
- `evening-prep.png` — 夜のおしたく
- `chores.png` — おてつだい
- `rewards.png` — ごほうび
- `calendar.png` — カレンダー
- `points.png` — ポイント
- `home.png` — ホーム
- `stats.png` — とうけい
- `settings.png` — 設定
- `school-building.png` — 学校まで（カウントダウンカード）
- `school-item.png` — 持ち物（汎用）

## Avatar icons
- `avatar-chick.png` — 🐣
- `avatar-bear.png` — 🐻
- `avatar-rabbit.png` — 🐰
- `avatar-cat.png` — 🐱
- `avatar-fox.png` — 🦊
- `avatar-dog.png` — 🐶
- `avatar-panda.png` — 🐼
- `avatar-lion.png` — 🦁

## Parent-mode icons
- `kids-settings.png` — お子さまの設定
- `family.png` — お子さま管理
- `alarm-clock.png` — 時間設定／時間内達成
- `approve.png` — おてつだい申請
- `notification-bell.png` — 通知設定
- `cloud-sync.png` — クラウド同期
- `history.png` — 完了履歴／交換履歴
- `photo-picker.png` — 写真を使う
- `perfect-bonus.png` — 朝＋夜パーフェクト
- `subjects.png` — 教科・持ち物を登録する
- `lessons.png` — 習い事
- `delete.png` — 削除（時間割の削除など）
- `timetable-subjects.png` — 時間割・教科
- `task-checklist.png` — 朝・夜タスク／未完了リマインド
- `reward-request.png` — ごほうび申請
- `timetable-switch.png` — 時間割の切り替え
- `rename.png` — 名前を変更
