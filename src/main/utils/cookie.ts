import { session } from 'electron';

export function removeAllCookie(url: string) {
  session.defaultSession.cookies.get({ url }).then((cookies) => {
    cookies.forEach((item) => {
      session.defaultSession.cookies.remove(url, item.name);
    });
  });
}
