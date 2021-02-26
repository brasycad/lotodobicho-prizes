# **Lotodobicho**

## Installation:

    npm install lotodobicho-prizes

## Use:

This service allows you to obtain the prizes of the draws of the **https://lotodobicho.com** application based on the HASH of the Bitcoin immediately after the date and time established for a draw.

For this purpose, the 128-bit Hash obtained in the previous draw (**prevHash**) is used. (In the first draw use '' as prevHash).

For example this 128 bits hash belong previous draw:
_d57cbd9ef56e9bc773c9ad93a2131d2e3ab64acf54ed1466da21efdd145b243_ \
_28cbd85971335a926ab9f3fd66a15c334973984fa7dbdbacfa6688b8078a9a65d_

Hash (64 bits) of the Bitcoin corresponding to timestamp 161313249616000 (**hash**):
_0000000000000000000b1447caf58d6d13ff4afee003c06fcb1edb30e159580d_

```js
import { PrizesService } from "lotodobicho-prizes";
const prizes = new PrizesService();
prizes.init(hash, prevHash);
console.log(prizes.parse);
```

1. 3267
2. 9284
3. 6640
4. 2036
5. 5574

- Modern 6801
- River 330
- Skipped 17
- Refund 1

You can also get the hash corresponding to this draw

```js
console.log(prizes.drawHash);
```

_53a88ea66279eedacb1a4015b8a9fc7a59c577f3425161127a2f8eb2db0dab68b_ \
_5be60cb29b167ec1df53e5c273f9b6eba002467f13005f2800f0446fed038a7_
