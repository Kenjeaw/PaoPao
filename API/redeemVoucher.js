const puppeteer = require('puppeteer');

// รวบรวมชื่อ selectors ของ element ต่างๆ ไว้ที่เดียว เพื่อให้แก้ไขง่ายในอนาคต
const SELECTORS = {
    phoneInput: '#mobile-text-field',
    submitButton: '#footer_button',
    cardToClick: '#card_0',
};

/**
 * รับซองอั่งเปา TrueMoney อัตโนมัติ ผ่านการจำลองการใช้งานบนเบราว์เซอร์
 *
 * @param {string} phoneNumber เบอร์โทรศัพท์ 10 หลักสำหรับรับเงิน
 * @param {string} voucherUrl ลิงก์ซองอั่งเปาแบบเต็ม (https://gift.truemoney.com/...)
 * @returns {Promise<{status: 'SUCCESS' | 'FAIL', amount?: number, reason?: string}>}
 *          Object ผลลัพธ์การทำงาน ประกอบด้วย status, จำนวนเงิน (amount), หรือเหตุผลที่ล้มเหลว (reason)
 */
async function redeemVoucher(phoneNumber, voucherUrl) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
        
        await page.goto(voucherUrl, { waitUntil: 'networkidle0' });

        // --- ขั้นตอนที่ 1: กรอกเบอร์โทรศัพท์ ---
        await page.waitForSelector(SELECTORS.phoneInput);
        await page.type(SELECTORS.phoneInput, phoneNumber);
        await page.click(SELECTORS.submitButton);

        // --- ขั้นตอนที่ 2: กดรับซอง (คลิกที่ซอง) ---
        // ดักรอ Response ของ API ที่จะเกิดขึ้น "หลังจาก" ที่เราคลิกการ์ด
        const finalResponsePromise = page.waitForResponse(response =>
            response.url().includes('/redeem') && response.request().method() === 'POST'
        );

        await page.waitForSelector(SELECTORS.cardToClick, { visible: true });
        await page.click(SELECTORS.cardToClick);

        // รอจนกว่า Promise ที่ดักรอไว้จะสำเร็จ แล้วดึงค่า JSON ออกมา
        const finalResponse = await finalResponsePromise;
        const responseJson = await finalResponse.json();

        if (responseJson.status.code === 'SUCCESS') {
            return {
                status: 'SUCCESS',
                amount: parseInt(responseJson.data.voucher.redeemed_amount_baht, 10),
            };
        } else {
            return {
                status: 'FAIL',
                reason: responseJson.status.message,
            };
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดระหว่างการรับซอง:", error.message);
        return {
            status: 'FAIL',
            reason: `Automation error: ${error.message}`,
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Export ฟังก์ชันเพื่อให้ไฟล์อื่นสามารถ import ไปใช้งานได้
module.exports = { redeemVoucher };
