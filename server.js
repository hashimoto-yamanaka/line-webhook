const express = require('express');
const line = require('@line/bot-sdk');

const app = express();

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(lineConfig);
const KENYAKU_TOKEN = 'kenyaku';

app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
  try {
    await Promise.all(req.body.events.map(handleEvent));
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).end();
  }
});

async function handleEvent(event) {
  console.log('Event received:', JSON.stringify(event));

  if (event.type === 'follow') {
    const userId = event.source.userId;
    console.log('Follow event from:', userId);
    console.log('Referral:', JSON.stringify(event.follow));

    const referral = event.follow?.referral;
    const isKenyaku = referral && referral.ref === KENYAKU_TOKEN;
    console.log('isKenyaku:', isKenyaku);

    if (isKenyaku) {
      return client.pushMessage(userId, {
        type: 'text',
        text: '賢約サポート診断をご利用いただきありがとうございます✨\nさらに詳しいことを知りたい方は"ご相談はこちら"を押してください☺️',
      });
    } else {
      return client.pushMessage(userId, {
        type: 'text',
        text: '📩【ご登録ありがとうございます】✨\n\nこの度は橋本メディカルサービスの公式LINEにご登録いただき、ありがとうございます。\n私たちは、全国約60,000件の高齢者施設の中から、ご希望やご状況に合わせて最適な施設をご紹介しています。\nさらに、グループ会社の医療法人とも連携して、医療と介護を一体的にサポート。\nご本人様やご家族様が安心してご利用いただけるよう、専門の相談員が丁寧に対応いたします☺️\n\nこのLINEでは、\n✅ ケアマネジャー様向けのイベント・セミナー情報\n✅ 高齢者施設探しのサポート\n✅ 介護保険や制度に関する最新情報\nなど、日々の施設紹介やお仕事に役立つ情報をお届けしていきます。\n\nまずはご挨拶を兼ねて【フルネーム】をチャットでお送りください😊\nスタッフが確認のうえ、安心してやり取りいただけるよう登録させていただきます。\nどんな小さなことでも大丈夫です。\n\n「施設探しを相談したい」「制度について知りたい」など、いつでもお気軽にご相談ください✨',
      });
    }
  }
}

app.listen(3000, () => console.log('Server running on port 3000'));
