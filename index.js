const { redeemVoucher } = require('./API/redeemVoucher');

// --- ตัวอย่างการใช้งาน ---
// หากต้องการรันสคริปต์นี้โดยตรง ให้แก้ไขข้อมูลด้านล่างแล้วรันคำสั่ง `node index.js`
(async () => {
    // --- กรุณาแก้ไขข้อมูลในส่วนนี้ ---
    const myPhoneNumber = 'xxxxxxxxxx'; // <--- แก้ไขเป็นเบอร์ของคุณ
    const myVoucherUrl = 'https://gift.truemoney.com/campaign/?v=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // <--- แก้ไขเป็นลิงก์ซองของคุณ

    console.log(`กำลังรับซองอั่งเปาสำหรับเบอร์ ${myPhoneNumber}...`);
    
    const result = await redeemVoucher(myPhoneNumber, myVoucherUrl);

    console.log('--- ผลลัพธ์ ---');
    console.log(result);
})();