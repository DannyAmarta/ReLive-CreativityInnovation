export async function jwtVerify(token: string) {
  return {
    payload: {
      sub: token,
    },
  };
}
