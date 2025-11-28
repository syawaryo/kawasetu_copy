:root {
  /* レイアウト幅 */
  --max-width: 1440px;
  --inner-width: 1160px;

  /* 横の余白・カード間のgap */
  --space-inline-01: 24px;
  --gap: 24px;

  /* 縦方向の余白 */
  --space-lg: 6rem;
  --space-md: 3rem;
  --space-sm: 1.5rem;
  --space-10: 0.625rem;

  /* カラー */
  --color-vi-blue: #0d56c9;
  --color-vi-navy: #132942;
  --color-ui-black: #1a1c20;
  --color-ui-white: #fff;
  --color-ui-bg: #f0f2f7;
  --color-ui-subtext: #686e78;
  --color-ui-border: #dde5f4;

  /* タイポ */
  --fz-root: 0.95rem;
  --fz-h2: clamp(1.5rem, 2.5vw, 2.25rem);
  --fz-lead: 1rem;
  --fz-small: 0.85rem;

  /* パーツ */
  --radius-card: 0.625rem;
  --shadow-card: 0px 10px 40px rgb(68 73 80 / 10%);

  /* 行間など */
  --line-height-base: 1.8;
}

body {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: Noto Sans JP, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  font-size: var(--fz-root);
  line-height: var(--line-height-base);
  color: var(--color-ui-black);
  background-color: var(--color-ui-white);
}


/* セクション全体 */
#pricing.container {
  padding-block: var(--space-lg);
  background-color: var(--color-ui-bg);
}

#pricing .inner,
#pricing [data-components-atoms-inner] {
  max-width: var(--inner-width);
  margin-inline: auto;
  padding-inline: var(--space-inline-01);
}

/* 見出し＆リード文 */
#pricing .heading {
  font-size: var(--fz-h2);
  font-weight: 700;
  text-align: center;
  margin: 0 0 var(--space-sm);
}

#pricing .lead {
  font-size: var(--fz-lead);
  color: var(--color-ui-subtext);
  text-align: center;
  margin: 0 auto var(--space-md);
  max-width: 720px;
}

/* プラン一覧レイアウト */
#pricing .content {
  margin-top: var(--space-sm);
}

#pricing .list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--gap);
}

/* 各プランカード */
#pricing .plan {
  background-color: var(--color-ui-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* ヘッダー部分 */
#pricing .plan_headerTitle {
  font-weight: 700;
  margin: 0 0 0.25rem;
}

#pricing .plan_headerNote {
  font-size: var(--fz-small);
  color: var(--color-ui-subtext);
  margin: 0;
}

/* 手数料ブロック */
#pricing .plan_chargeInner {
  margin: 0;
  padding: var(--space-sm) 0;
  border-top: 1px solid var(--color-ui-border);
  border-bottom: 1px solid var(--color-ui-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

#pricing .plan_key {
  font-size: var(--fz-small);
  color: var(--color-ui-subtext);
  margin: 0;
}

#pricing .plan_chargeValue {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

#pricing .plan_chargeBrandInner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

#pricing .plan_chargeNum {
  font-size: 1.8rem;
  font-weight: 700;
}

/* 月額費用ブロック */
#pricing .plan_monthly {
  margin: 0;
  padding-top: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

#pricing .plan_monthlyValue p {
  margin: 0;
}

#pricing .plan_monthlyNum {
  font-size: 1.5rem;
  font-weight: 700;
}

#pricing .plan_monthlyNote {
  font-size: var(--fz-small);
  color: var(--color-ui-subtext);
}



