'use strict'

{
    const radios = document.querySelectorAll('input[name="coord-type"]');
    const xyForm = document.getElementById('xy-fields');
    const polarForm = document.getElementById('polar-fields');

    // ラジオボタンの値に応じてフォームの表示を切り替える関数
    function updateFormDisplay(value) {
        if (value === 'object-xy') {
            xyForm.style.display = 'flex';
            polarForm.style.display = 'none';
        } else if (value === 'object-polar') {
            xyForm.style.display = 'none';
            polarForm.style.display = 'flex';
        }
    }
    // 初期状態の表示制御
    const checkedRadio = document.querySelector('input[name="coord-type"]:checked');
    if (checkedRadio) updateFormDisplay(checkedRadio.value);
    // イベントバインド（全部のラジオに対応）
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateFormDisplay(radio.value);
            calculateCoordinates(); // ← ラジオ切り替え時にも計算
        });
    });

    const cxInput = document.getElementById('cx');
    const cyInput = document.getElementById('cy');
    const oxInput = document.getElementById('ox');
    const oyInput = document.getElementById('oy');
    const oRadiusInput = document.getElementById('o-radius');
    const oDegInput = document.getElementById('o-deg');
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
        let ox = 0, oy = 0; // オブジェクト座標の初期値

        // 最新のラジオボタン選択状態を取得
        const selectedRadio = document.querySelector('input[name="coord-type"]:checked');

        if (selectedRadio && selectedRadio.value === 'object-xy') {
            ox = evaluateExpression(oxInput.value);
            oy = evaluateExpression(oyInput.value);

            // オブジェクト座標の一方でも入力が無効な場合はどちらも初期値として0を適用する。
            if (ox === null || oy === null) {
                ox = 0;
                oy = 0;
            }
        } else if (selectedRadio && selectedRadio.value === 'object-polar') {
            // 楕円座標系のオブジェクト座標を取得
            let oRadius = evaluateExpression(oRadiusInput.value);
            let oDeg = evaluateExpression(oDegInput.value);
            // 楕円座標系の半径と角度を使って、オブジェクト座標を計算
            if (oRadius !== null && oDeg !== null) {
                ox = cx + oRadius * Math.cos(oDeg * Math.PI / 180);

                if (invertYCheckbox.checked) {
                    oy = cy - oRadius * Math.sin(oDeg * Math.PI / 180);
                } else {
                    oy = cy + oRadius * Math.sin(oDeg * Math.PI / 180);
                }
            } else {
                // 入力が無効な場合はオブジェクト座標を0に設定
                ox = 0;
                oy = 0;
            }
        }


        // 入力が無効な場合は結果を表示しない
        if (cx === null || cy === null || r === null || deg === null) {
            xResult.textContent = '--';
            yResult.textContent = '--';
            return;
        }

        // 度をラジアンに変換
        const rad = deg * Math.PI / 180;
        // 中心座標(cx, cy)と半径(r)を使って、円周上の点の座標を計算
        const x = (cx - ox) + r * Math.cos(rad);
        let y = r * Math.sin(rad);

        // Y座標の反転チェックボックスがチェックされている場合、Y座標を反転
        if (invertYCheckbox.checked) {
            y *= -1;
        }

        y = (cy - oy) + y; // 中心座標を加える


        // 結果を小数点以下5桁まで表示
        xResult.textContent = x.toFixed(5);
        yResult.textContent = y.toFixed(5);
    }

    // 入力が変わったら再計算
    [cxInput, cyInput,
    oxInput, oyInput,
    oRadiusInput, oDegInput,
    radiusInput, degInput,
    invertYCheckbox].forEach(input => {
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
            // アニメーション中は何もしない
            if (isAnimating) return;
            // 計算結果が無効な場合は何もしない
            if (xResult.textContent === '--' || yResult.textContent === '--') return;

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


