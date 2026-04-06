const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

// Logic Menu Mobile
if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

// Logic đổi ảnh sản phẩm chi tiết
const MainImg = document.getElementById("MainImg");
const smallimg = document.getElementsByClassName("small-img");

if (MainImg && smallimg.length > 0) {
    smallimg[0].onclick = function () { MainImg.src = smallimg[0].src; }
    smallimg[1].onclick = function () { MainImg.src = smallimg[1].src; }
    smallimg[2].onclick = function () { MainImg.src = smallimg[2].src; }
    smallimg[3].onclick = function () { MainImg.src = smallimg[3].src; }
}

// ==========================================
// TÍNH NĂNG GIỎ HÀNG (SỬ DỤNG LOCALSTORAGE)
// ==========================================

// Hàm format tiền Việt Nam (vd: 5000000 -> 5.000.000)
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Hàm chuyển đổi chuỗi tiền thành số để tính toán (vd: "5.000.000đ" -> 5000000)
function parsePrice(priceText) {
    return parseFloat(priceText.replace(/\./g, '').replace('đ', '').trim());
}

document.addEventListener('DOMContentLoaded', () => {

    // 1. CHỨC NĂNG THÊM VÀO GIỎ HÀNG TỪ TRANG CHỦ / CỬA HÀNG (index.html, shop.html)
    const cartIcons = document.querySelectorAll('.pro .cart, .pro .fa-cart-shopping');

    cartIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Rất quan trọng: Ngăn việc click giỏ hàng làm nhảy sang trang product.html

            // Tìm phần tử div class="pro" chứa sản phẩm vừa click
            const proBox = icon.closest('.pro');
            const productImg = proBox.querySelector('img').src;
            const productName = proBox.querySelector('.des h5').innerText;
            const productPriceText = proBox.querySelector('.des h4').innerText;
            const productPrice = parsePrice(productPriceText);

            addToCart(productImg, productName, productPrice, 1);
            alert(`Đã thêm "${productName}" vào giỏ hàng!`);
        });
    });

    // 2. CHỨC NĂNG THÊM VÀO GIỎ HÀNG TỪ TRANG CHI TIẾT SẢN PHẨM (product.html)
    const singleProBtn = document.querySelector('#prodetails button.normal');
    if (singleProBtn && singleProBtn.innerText.includes('Thêm vào giỏ hàng')) {
        singleProBtn.addEventListener('click', () => {
            const productImg = document.querySelector('#MainImg').src;
            const productName = document.querySelector('.single-pro-details h4').innerText;
            const productPriceText = document.querySelector('.single-pro-details h2').innerText;
            const quantityInput = document.querySelector('.single-pro-details input[type="number"]');
            
            const quantity = parseInt(quantityInput.value);
            const productPrice = parsePrice(productPriceText);

            addToCart(productImg, productName, productPrice, quantity);
            alert(`Đã thêm ${quantity} sản phẩm "${productName}" vào giỏ hàng!`);
        });
    }

    // 3. HÀM XỬ LÝ LƯU VÀO LOCALSTORAGE
    function addToCart(img, name, price, quantity) {
        // Lấy giỏ hàng từ bộ nhớ, nếu chưa có thì tạo mảng rỗng
        let cart = JSON.parse(localStorage.getItem('cartData')) || [];

        // Kiểm tra xem sản phẩm đã có trong giỏ chưa (dựa vào tên)
        let existingProduct = cart.find(item => item.name === name);
        if (existingProduct) {
            existingProduct.quantity += quantity; // Nếu có rồi thì cộng dồn số lượng
        } else {
            cart.push({ img, name, price, quantity }); // Chưa có thì thêm mới
        }

        // Lưu ngược lại vào bộ nhớ trình duyệt
        localStorage.setItem('cartData', JSON.stringify(cart));
    }

    // 4. HIỂN THỊ VÀ XỬ LÝ TRONG TRANG GIỎ HÀNG (cart.html)
    const cartTableBody = document.querySelector('#cart tbody');
    if (cartTableBody) {
        renderCart(); // Chạy hàm render ngay khi vào trang Giỏ hàng

        // Lắng nghe sự kiện click để xóa sản phẩm (Event Delegation)
        cartTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-times-circle') || e.target.closest('a')) {
                e.preventDefault();
                const tr = e.target.closest('tr');
                const index = tr.getAttribute('data-index');
                removeItem(index);
            }
        });

        // Lắng nghe sự kiện đổi số lượng ô input
        cartTableBody.addEventListener('input', (e) => {
            if (e.target.type === 'number') {
                const tr = e.target.closest('tr');
                const index = tr.getAttribute('data-index');
                let newQty = parseInt(e.target.value);
                
                // Không cho phép nhập số âm hoặc chữ
                if (newQty < 1 || isNaN(newQty)) {
                    newQty = 1;
                    e.target.value = 1;
                }
                updateQuantity(index, newQty);
            }
        });
    }

    // Hàm Vẽ (Render) lại giỏ hàng dựa trên dữ liệu LocalStorage
    function renderCart() {
        let cart = JSON.parse(localStorage.getItem('cartData')) || [];
        
        // Xóa các sản phẩm fix cứng cũ trong file HTML đi
        cartTableBody.innerHTML = '';
        let totalAmount = 0;

        if (cart.length === 0) {
            cartTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px;">Giỏ hàng của bạn đang trống! Hãy quay lại cửa hàng để mua sắm.</td></tr>`;
        } else {
            cart.forEach((item, index) => {
                const rowTotal = item.price * item.quantity;
                totalAmount += rowTotal;

                const tr = document.createElement('tr');
                tr.setAttribute('data-index', index);
                tr.innerHTML = `
                    <td><a href="#"><i class="far fa-times-circle"></i></a></td>
                    <td><img width="200px" class="cart-img" style="border-radius:8px;" src="${item.img}" alt=""></td>
                    <td style="font-weight:600;">${item.name}</td>
                    <td>${formatPrice(item.price)}đ</td>
                    <td><input type="number" value="${item.quantity}" min="1"></td>
                    <td style="color:#088178; font-weight:700;">${formatPrice(rowTotal)}đ</td>
                `;
                cartTableBody.appendChild(tr);
            });
        }

        // Cập nhật bảng tổng tiền phía dưới giỏ hàng
        const cartSubtotal = document.querySelector('#subtotal table tr:nth-child(1) td:nth-child(2)');
        const cartTotal = document.querySelector('#subtotal table tr:nth-child(3) td:nth-child(2) strong');

        if (cartSubtotal && cartTotal) {
            cartSubtotal.innerText = formatPrice(totalAmount) + 'đ';
            cartTotal.innerText = formatPrice(totalAmount) + 'đ';
        }
    }

    // Hàm xóa 1 sản phẩm
    function removeItem(index) {
        let cart = JSON.parse(localStorage.getItem('cartData')) || [];
        cart.splice(index, 1); // Xóa 1 phần tử tại vị trí index
        localStorage.setItem('cartData', JSON.stringify(cart));
        renderCart(); // Cập nhật lại giao diện ngay lập tức
    }

    // Hàm cập nhật số lượng khi bấm tăng giảm mũi tên
    function updateQuantity(index, quantity) {
        let cart = JSON.parse(localStorage.getItem('cartData')) || [];
        cart[index].quantity = quantity;
        localStorage.setItem('cartData', JSON.stringify(cart));
        renderCart(); // Cập nhật lại giao diện
    }
});
