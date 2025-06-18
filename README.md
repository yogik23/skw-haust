# Haust Testnet


### [Metamask Wallet](https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?utm_source=google.com)
### [Link Testnet](https://dex.testnet.haust.app/#/swap)
### [Link Faucet Haust1](https://faucet.haust.app/)
### [Link Faucet Haust2](https://t.me/haust_testnet_faucet_bot)

## Fitur Autobot
- Auto Swap
- Send Jumlah Tx ke Telegram
- Multi Akun
- Sudah Pasti Eligible

## Step RUN

1. Clone repo dan masuk ke folder
    ```
    git clone https://github.com/yogik23/skw-haust.git && cd skw-haust
    ```
2. Install Module
    ```
    npm install
    ```
3. Submit PrivateKey di `privatekey.txt`
    ```
    nano privatekey.txt
    ```
   format privatekey.txt
    ```
    Privatekey1....
    Privatekey2....
    Privatekey3....
    ```
4. Submit Tokenbot dan ID tele di `.env` 
    ```
    nano .env
    ```
   format .env / ganti true ke false untuk off
    ```
    SEND_TO_TG=true
    CHAT_ID=userIDtelegram
    BOT_TOKEN=tokendariBotFather
    ```
5. Jalankan bot 
    ```
    npm start
    ```


**Sodah kerjekan mun sian botnye**
