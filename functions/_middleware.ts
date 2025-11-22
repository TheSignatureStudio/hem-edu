// Cloudflare Pages Functions - D1 바인딩 설정

export interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  return context.next();
};

