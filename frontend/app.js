const API_URL = "https://dc-innovation-crud.onrender.com/api/products";

const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable");
const message = document.getElementById("message");

const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

let editingId = null;
let products = [];

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#b91c1c" : "#15803d";
}

async function requestAPI(url, options = {}) {
    const response = await fetch(url, options);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || data.message || "Request failed");
    }

    return data;
}

async function loadProducts() {
    try {
        products = await requestAPI(API_URL);

        renderProducts();
        updateDashboard();
    } catch (error) {
        productTable.innerHTML = `
            <tr>
                <td colspan="7">Unable to load products. Check that your backend is running.</td>
            </tr>
        `;

        showMessage(error.message, true);
    }
}

function renderProducts() {
    if (products.length === 0) {
        productTable.innerHTML = `
            <tr>
                <td colspan="7">No products found. Add your first product.</td>
            </tr>
        `;
        return;
    }

    productTable.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${escapeHTML(product.product_name)}</td>
            <td>${escapeHTML(product.category)}</td>
            <td>${Number(product.price).toLocaleString()}</td>
            <td>${product.quantity}</td>
            <td>${escapeHTML(product.description || "")}</td>
            <td>
                <div class="actions">
                    <button
                        class="edit"
                        data-action="edit"
                        data-id="${product.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="delete"
                        data-action="delete"
                        data-id="${product.id}"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function updateDashboard() {
    document.getElementById("totalProducts").textContent =
        products.length;

    const stock = products.reduce(
        (total, product) => total + Number(product.quantity || 0),
        0
    );

    document.getElementById("totalStock").textContent =
        stock.toLocaleString();

    const value = products.reduce(
        (total, product) =>
            total + Number(product.price || 0) *
                    Number(product.quantity || 0),
        0
    );

    document.getElementById("inventoryValue").textContent =
        value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
}

productForm.addEventListener("submit", async event => {
    event.preventDefault();

    const product = {
        product_name: document.getElementById("product_name").value.trim(),
        category: document.getElementById("category").value.trim(),
        price: Number(document.getElementById("price").value),
        quantity: Number(document.getElementById("quantity").value),
        description: document.getElementById("description").value.trim()
    };

    if (
        !product.product_name ||
        !product.category ||
        product.price < 0 ||
        !Number.isFinite(product.price) ||
        !Number.isInteger(product.quantity) ||
        product.quantity < 0
    ) {
        showMessage("Enter valid product details.", true);
        return;
    }

    try {
        if (editingId === null) {
            await requestAPI(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)
            });

            showMessage("Product added successfully!");
        } else {
            await requestAPI(`${API_URL}/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)
            });

            showMessage("Product updated successfully!");
        }

        resetForm();
        await loadProducts();
    } catch (error) {
        showMessage(error.message, true);
    }
});

productTable.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "edit") {
        const product = products.find(item => item.id === id);

        if (!product) {
            showMessage("Product not found.", true);
            return;
        }

        editingId = id;

        document.getElementById("product_name").value =
            product.product_name;

        document.getElementById("category").value =
            product.category;

        document.getElementById("price").value =
            product.price;

        document.getElementById("quantity").value =
            product.quantity;

        document.getElementById("description").value =
            product.description || "";

        formTitle.textContent = "Edit Product";
        saveButton.textContent = "Save Changes";
        cancelButton.hidden = false;

        productForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        return;
    }

    if (action === "delete") {
        const product = products.find(item => item.id === id);

        if (!product) {
            showMessage("Product not found.", true);
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to delete "${product.product_name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await requestAPI(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            if (editingId === id) {
                resetForm();
            }

            showMessage("Product deleted successfully!");
            await loadProducts();
        } catch (error) {
            showMessage(error.message, true);
        }
    }
});

function resetForm() {
    productForm.reset();
    editingId = null;

    formTitle.textContent = "Add New Product";
    saveButton.textContent = "Add Product";
    cancelButton.hidden = true;
}

cancelButton.addEventListener("click", resetForm);

loadProducts();