document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.nav li a');
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.querySelector(".nav");
    const leftDiv = document.querySelector('.left');
    const reviewContainer = document.querySelector('.input-container');


    // Highlight current page in menu
    menuItems.forEach(menuItem => {
        const menuItemLink = menuItem.getAttribute('href');
        if (currentPath === menuItemLink) {
            menuItem.style.color = "#000000";
            menuItem.style.borderBottom = "2px solid #af2639";
        } else {
            menuItem.style.color = "rgba(0, 0, 0, 0.4)";
        }
    });

    // Menu toggle functionality
    menuToggle.addEventListener("click", function () {
        nav.classList.toggle("show");
    });

    // Dynamic layout adjustment
	function adjustLayout() {
	// Check if reviewContainer exists
		if (!reviewContainer) {
			return; // Exit the function if reviewContainer does not exist
		}

		if (window.innerWidth < 768) {
			leftDiv.classList.remove('left');
			reviewContainer.innerHTML = '<form id="review-form"><textarea id="review" name="review" placeholder="Your Review" required></textarea><input type="submit" value="Submit"></form>';
		} else {
			leftDiv.classList.add('left');
			reviewContainer.innerHTML = '<form id="review-form"><input type="text" id="review" name="review" placeholder="Your Review" required><input type="submit" value="Submit"></form>';
		}
		attachFormSubmitEvent();
	}

function attachFormSubmitEvent() {
    const overlay = document.getElementById('overlay');
    const loader = document.getElementById('loader');
    const popup = document.getElementById('popup');
    const responseContent = document.getElementById('responseContent');
    const form = document.getElementById('review-form');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            overlay.style.display = 'block';
            loader.style.display = 'block';

            const formData = new FormData(form);
            const data = { 'text': formData.get('review') };

            fetch('http://localhost:4999/predict', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error); // 只抛出错误信息
                    });
                }
                return response.json();
            })
            .then(data => {
                overlay.style.display = 'none';
                loader.style.display = 'none';
                popup.style.display = 'block';

                if (!data.aspects || data.aspects.length === 0) {
                    let new_sentence = buildSentence(data);
                    responseContent.innerHTML = new_sentence + "<br/><br/><i class='fas fa-sad-tear'></i> Sorry, we didn't detect any aspect from your input.";
                } else {
                    let new_sentence = buildSentence(data);
                    let table_html = buildTable(data);
                    responseContent.innerHTML = "<p style='font-size:24px;font-weight:bold;'>Sentence:</p><br/>" + new_sentence + "<br/><br/>" + table_html;
                }
            })
            .catch(error => {
                overlay.style.display = 'none';
                loader.style.display = 'none';
                popup.style.display = 'block';
                responseContent.innerHTML = "<p style='color: red;'><i class='fas fa-exclamation-circle'></i> " + error.message + "</p>";
                console.error('Error:', error);
            });
        });
    }
}

function buildSentence(data) {
    let new_sentence = "";
    if (data.tokens && data.positions) {
        data.tokens.forEach((token, i) => {
            let nextToken = data.tokens[i + 1] || "";
            let sentiment = data.positions.includes(i) ? data.sentiments[data.positions.indexOf(i)] : null;
            let colored_token = token;
            
            if (sentiment === "Positive") {
                colored_token = `<span style="color: green;">${token}</span>`;
            } else if (sentiment === "Negative") {
                colored_token = `<span style="color: red;">${token}</span>`;
            } else if (sentiment === "Neutral") {
                colored_token = `<span style="color: #444;">${token}</span>`;
            }

            new_sentence += colored_token;
            if (!nextToken.match(/^[\.,;!?]/)) {
                new_sentence += " ";
            }
        });
    }
    return new_sentence;
}

function buildTable(data) {
    let table_html = '<table style="width: 100%; border-collapse: collapse;">';
    table_html += '<tr><th style="border: 1px solid #FF8C00; padding: 8px; text-align: left;">Aspect</th><th style="border: 1px solid #FF8C00; padding: 8px; text-align: left;">Polarity</th><th style="border: 1px solid #FF8C00; padding: 8px; text-align: left;">Confidence</th></tr>';
    data.aspects.forEach((aspect, index) => {
        table_html += `<tr><td style="border: 1px solid #FF8C00; padding: 8px; text-align: left;">${aspect}</td><td style="border: 1px solid #FF8C00; padding: 8px; text-align: left;">${data.sentiments[index]}</td><td style="border: 1px solid #FF8C00; padding: 8px; text-align: left;">${data.confidences[index]}</td></tr>`;
    });
    table_html += '</table>';
    return table_html;
}



    adjustLayout();
    window.addEventListener('resize', adjustLayout);
	
	// 尝试获取 closeButton
    var closeButton = document.querySelector('#closeButton');

    // 检查 closeButton 是否获取成功
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            // 这里处理点击事件
            if (popup) {
                popup.style.display = 'none';
            }
        });
    } else {
        console.log('closeButton not found in the DOM');
    }
});
