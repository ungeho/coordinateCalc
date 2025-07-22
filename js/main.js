'use strict'

{
    const cxInput = document.getElementById('cx');
    const cyInput = document.getElementById('cy');
    const radiusInput = document.getElementById('radius');
    const degInput = document.getElementById('deg');
    const xResult = document.getElementById('x-result');
    const yResult = document.getElementById('y-result');
    // Y座標のチェックボックス
    const invertYCheckbox = document.getElementById('invert-y');


    // 数式の形になっているかを評価
    // 初等関数、特殊関数は含まない
    function evaluateExpression(input) {
        try {
            // 数字・演算子・空白・括弧以外が含まれていないか検査（安全性確保）
            if (!/^[0-9+\-*/().\s]+$/.test(input)) return null;

            const result = new Function(`return (${input})`)();
            return typeof result === 'number' && isFinite(result) ? result : null;
        } catch {
            return null;
        }
    }



    // 座標計算部分
    function calculateCoordinates() {
        const cx = evaluateExpression(cxInput.value);
        const cy = evaluateExpression(cyInput.value);
        const r = evaluateExpression(radiusInput.value);
        const deg = evaluateExpression(degInput.value);

        if (cx === null || cy === null || r === null || deg === null) {
            xResult.textContent = '--';
            yResult.textContent = '--';
            return;
        }

        const rad = deg * Math.PI / 180;
        const x = cx + r * Math.cos(rad);
        let y = cy + r * Math.sin(rad);

        if (invertYCheckbox.checked) {
            y *= -1;
        }

        xResult.textContent = x.toFixed(5);
        yResult.textContent = y.toFixed(5);
    }

    // 入力が変わったら再計算
    [cxInput, cyInput, radiusInput, degInput, invertYCheckbox].forEach(input => {
        input.addEventListener('input', calculateCoordinates);
        input.addEventListener('change', calculateCoordinates); // チェックボックス用
    });

    window.addEventListener('DOMContentLoaded', calculateCoordinates);



    // 計算結果のコピー部分

    function copyTextOnClick(resultId, msgId) {
        const resultEl = document.getElementById(resultId);
        const msgEl = document.getElementById(msgId);
        let isAnimating = false;

        resultEl.addEventListener("click", () => {
            if (isAnimating) return;

            const value = resultEl.textContent;
            navigator.clipboard.writeText(value).then(() => {
                isAnimating = true;

                // 初期表示の準備
                msgEl.textContent = "✔ コピーしました！";
                msgEl.style.opacity = "1";
                msgEl.style.transition = "none"; // 一旦リセット
                msgEl.classList.remove("fade-out");

                // 次のフレームで transition を再適用
                requestAnimationFrame(() => {
                    msgEl.style.transition = "opacity 1s ease"; // ← ★ここを1秒に調整

                    // 0.5秒後にフェードアウト開始
                    setTimeout(() => {
                        msgEl.style.opacity = "0";
                    }, 500);

                    // 1秒後に消える → 合計1.5秒後にリセット
                    setTimeout(() => {
                        msgEl.textContent = "";
                        msgEl.style.opacity = "1";
                        msgEl.style.transition = "none";
                        isAnimating = false;
                    }, 1500);
                });
            }).catch(err => {
                msgEl.textContent = "コピー失敗";
                console.error("コピー失敗:", err);
            });
        });
    }

    copyTextOnClick("x-result", "x-msg");
    copyTextOnClick("y-result", "y-msg");
}