
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  ShoppingCart,
  CalendarDays,
  UserRound,
  Phone,
  MapPin,
  UserCheck,
  Clock3,
  Pencil,
  Trash2,
  Hash,
  Package,
  X,
  AlertTriangle,
} from "lucide-react";

/* =========================================================
   FALLBACK PRODUCTS
========================================================= */

const defaultProducts = [
  {
    id: "fallback-1",
    name: "Product A",
    code: "PRA-001",
    stock: 42,
  },
  {
    id: "fallback-2",
    name: "Product B",
    code: "PRB-002",
    stock: 18,
  },
  {
    id: "fallback-3",
    name: "Product C",
    code: "PRC-003",
    stock: 11,
  },
];

/* =========================================================
   STAFF
========================================================= */

const staffList = [
  "Amit Sharma",
  "Rahul Verma",
  "Mohit Kumar",
  "Neha Sharma",
];

/* =========================================================
   INITIAL SALES
========================================================= */

const initialSales = [
  {
    id: 1,
    saleDate: "2026-09-10",
    customerName: "Rahul Sharma",
    mobile: "9876543210",
    address: "Jhunjhunu, Rajasthan",
    product: "Product A",
    productId: "fallback-1",
    quantity: 1,
    serial: "PRA001-0001",
    duration: 180,
    soldThrough: "Amit Sharma",
    reminderDate: "2027-03-09",
  },
];

/* =========================================================
   CONSTANTS
========================================================= */

const LOW_STOCK_LIMIT = 5;
const REMINDER_WINDOW_DAYS = 10;

/* =========================================================
   DATE HELPERS
========================================================= */

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function addDays(dateString, days) {
  if (!dateString || !days) {
    return "";
  }

  const date = parseDate(dateString);

  if (!date) {
    return "";
  }

  date.setDate(
    date.getDate() + Number(days)
  );

  const resultYear = date.getFullYear();

  const resultMonth = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const resultDay = String(
    date.getDate()
  ).padStart(2, "0");

  return `${resultYear}-${resultMonth}-${resultDay}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = parseDate(dateString);

  if (!date) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysLeft(dateString) {
  if (!dateString) return null;

  const today = parseDate(getToday());
  const target = parseDate(dateString);

  if (!today || !target) {
    return null;
  }

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.round(
    (target - today) /
      (1000 * 60 * 60 * 24)
  );
}

/* =========================================================
   EMPTY FORM
========================================================= */

const getEmptyForm = () => ({
  saleDate: getToday(),
  customerName: "",
  mobile: "",
  address: "",
  product: "",
  productId: "",
  quantity: 1,
  serial: "",
  duration: 30,
  soldThrough: "",
});

/* =========================================================
   SAFE LOCAL STORAGE
========================================================= */

function readLocalStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : fallback;
  } catch {
    return fallback;
  }
}

/* =========================================================
   NORMALIZE PRODUCTS
=========================================================

   Products.jsx structure:

   [
     {
       id,
       brand,
       category,
       productName,
       variants: [
         {
           id,
           name,
           sku,
           stock
         }
       ]
     }
   ]

   Sales page converts every variant into
   one selectable product.
========================================================= */

function normalizeProducts(rawProducts) {
  if (!Array.isArray(rawProducts)) {
    return defaultProducts;
  }

  const normalized = [];

  rawProducts.forEach((product) => {
    /* -----------------------------------------------------
       NEW PRODUCTS COMPONENT STRUCTURE
    ----------------------------------------------------- */

    if (
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      product.variants.forEach((variant) => {
        normalized.push({
          id: String(
            variant.id ??
              `${product.id}-${variant.sku}`
          ),

          name: `${product.brand} - ${variant.name}`,

          shortName: variant.name,

          brand: product.brand,

          category: product.category,

          productName: product.productName,

          code:
            variant.sku ||
            `${product.brand}-${variant.name}`,

          sku: variant.sku || "",

          stock:
            Number(variant.stock) || 0,
        });
      });

      return;
    }

    /* -----------------------------------------------------
       OLD / SIMPLE PRODUCT STRUCTURE
    ----------------------------------------------------- */

    if (product.name) {
      normalized.push({
        id: String(
          product.id ?? product.code ?? product.name
        ),

        name: product.name,

        shortName: product.name,

        brand: product.brand || "",

        category: product.category || "",

        productName:
          product.productName || product.name,

        code:
          product.code ||
          product.sku ||
          "",

        sku:
          product.sku ||
          product.code ||
          "",

        stock:
          Number(product.stock) || 0,
      });
    }
  });

  return normalized.length > 0
    ? normalized
    : defaultProducts;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Sales() {
  /* =======================================================
     SALES STATE
  ======================================================= */

  const [sales, setSales] = useState(() =>
    readLocalStorage(
      "kcc_sales",
      initialSales
    )
  );

  /* =======================================================
     PRODUCTS STATE
  ======================================================= */

  const [products, setProducts] = useState(() => {
    const savedProducts = readLocalStorage(
      "kcc_products",
      defaultProducts
    );

    return normalizeProducts(
      savedProducts
    );
  });

  /* =======================================================
     UI STATES
  ======================================================= */

  const [showForm, setShowForm] =
    useState(false);

  const [editingSaleId, setEditingSaleId] =
    useState(null);

  const [deleteSaleId, setDeleteSaleId] =
    useState(null);

  const [selectedSale, setSelectedSale] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState(getEmptyForm());

  /* =======================================================
     LOAD / SYNC PRODUCTS
  ======================================================= */

  useEffect(() => {
    const syncProducts = () => {
      const savedProducts =
        readLocalStorage(
          "kcc_products",
          defaultProducts
        );

      setProducts(
        normalizeProducts(savedProducts)
      );
    };

    syncProducts();

    window.addEventListener(
      "storage",
      syncProducts
    );

    window.addEventListener(
      "kcc-products-updated",
      syncProducts
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncProducts
      );

      window.removeEventListener(
        "kcc-products-updated",
        syncProducts
      );
    };
  }, []);

  /* =======================================================
     SAVE SALES
  ======================================================= */

  const saveSales = (updatedSales) => {
    setSales(updatedSales);

    try {
      localStorage.setItem(
        "kcc_sales",
        JSON.stringify(updatedSales)
      );
    } catch {
      console.error(
        "Unable to save sales."
      );
    }

    window.dispatchEvent(
      new Event("kcc-sales-updated")
    );
  };

  /* =======================================================
     SELECTED PRODUCT
  ======================================================= */

  const selectedProduct = useMemo(() => {
    return products.find(
      (product) =>
        String(product.id) ===
        String(form.productId)
    );
  }, [
    products,
    form.productId,
  ]);

  /* =======================================================
     REMINDER DATE
  ======================================================= */

  const reminderDate = useMemo(() => {
    const duration =
      Number(form.duration);

    if (
      !form.saleDate ||
      !duration ||
      duration < 1
    ) {
      return "";
    }

    return addDays(
      form.saleDate,
      duration
    );
  }, [
    form.saleDate,
    form.duration,
  ]);

  /* =======================================================
     UPCOMING REMINDERS
     
     ONLY SHOW:
     0 TO 10 DAYS LEFT

     EXPIRED = NO
     11+ DAYS = NO
  ======================================================= */

  const upcomingReminders = useMemo(() => {
    return sales.filter((sale) => {
      const daysLeft =
        getDaysLeft(
          sale.reminderDate
        );

      return (
        daysLeft !== null &&
        daysLeft >= 0 &&
        daysLeft <=
          REMINDER_WINDOW_DAYS
      );
    });
  }, [sales]);

  /* =======================================================
     LOW STOCK PRODUCTS

     ONLY SHOW WHEN STOCK < 5
  ======================================================= */

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (product) =>
        Number(product.stock) <
        LOW_STOCK_LIMIT
    );
  }, [products]);

  /* =======================================================
     FILTER SALES
  ======================================================= */

  const filteredSales = useMemo(() => {
    const keyword =
      search.toLowerCase().trim();

    if (!keyword) {
      return sales;
    }

    return sales.filter((sale) =>
      [
        sale.customerName,
        sale.mobile,
        sale.product,
        sale.serial,
        sale.soldThrough,
        sale.address,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [sales, search]);

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setForm(getEmptyForm());

    setEditingSaleId(null);
  };

  /* =======================================================
     HANDLE FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    if (name === "productId") {
      const product =
        products.find(
          (item) =>
            String(item.id) ===
            String(value)
        );

      setForm((previous) => ({
        ...previous,

        productId: value,

        product:
          product?.name || "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,

      [name]:
        name === "quantity" ||
        name === "duration"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  /* =======================================================
     NEW SALE
  ======================================================= */

  const openNewSale = () => {
    resetForm();

    setShowForm(true);
  };

  /* =======================================================
     EDIT SALE
  ======================================================= */

  const openEditSale = (sale) => {
    const matchingProduct =
      products.find(
        (product) =>
          product.name ===
            sale.product ||
          String(product.id) ===
            String(sale.productId)
      );

    setEditingSaleId(
      sale.id
    );

    setForm({
      saleDate:
        sale.saleDate ||
        getToday(),

      customerName:
        sale.customerName ||
        "",

      mobile:
        sale.mobile ||
        "",

      address:
        sale.address ||
        "",

      product:
        sale.product ||
        "",

      productId:
        sale.productId ||
        matchingProduct?.id ||
        "",

      quantity:
        Number(sale.quantity) || 1,

      serial:
        sale.serial ||
        "",

      duration:
        Number(sale.duration) ||
        30,

      soldThrough:
        sale.soldThrough ||
        "",
    });

    setShowForm(true);
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm = () => {
    setShowForm(false);

    resetForm();
  };

  /* =======================================================
     SERIAL DUPLICATE CHECK
  ======================================================= */

  const isSerialAlreadyUsed = (
    serial,
    currentSaleId
  ) => {
    const cleanSerial =
      serial.trim().toLowerCase();

    if (!cleanSerial) {
      return false;
    }

    return sales.some(
      (sale) =>
        sale.id !== currentSaleId &&
        sale.serial &&
        sale.serial
          .trim()
          .toLowerCase() ===
          cleanSerial
    );
  };

  /* =======================================================
     SUBMIT SALE
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    const duration =
      Number(form.duration);

    const quantity =
      Number(form.quantity);

    /* -----------------------------------------------------
       REQUIRED FIELDS
    ----------------------------------------------------- */

    if (
      !form.saleDate ||
      !form.customerName.trim() ||
      !form.mobile.trim() ||
      !form.address.trim() ||
      !form.productId ||
      !form.soldThrough
    ) {
      alert(
        "Please fill all required fields."
      );

      return;
    }

    /* -----------------------------------------------------
       MOBILE VALIDATION
    ----------------------------------------------------- */

    const cleanMobile =
      form.mobile.replace(/\D/g, "");

    if (
      cleanMobile.length !== 10
    ) {
      alert(
        "Please enter a valid 10 digit mobile number."
      );

      return;
    }

    /* -----------------------------------------------------
       DURATION
    ----------------------------------------------------- */

    if (
      duration < 1 ||
      duration > 365
    ) {
      alert(
        "Duration must be between 1 and 365 days."
      );

      return;
    }

    /* -----------------------------------------------------
       QUANTITY
    ----------------------------------------------------- */

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      alert(
        "Quantity must be at least 1."
      );

      return;
    }

    /* -----------------------------------------------------
       PRODUCT
    ----------------------------------------------------- */

    const product =
      products.find(
        (item) =>
          String(item.id) ===
          String(form.productId)
      );

    if (!product) {
      alert(
        "Selected product was not found."
      );

      return;
    }

    /* -----------------------------------------------------
       STOCK VALIDATION
       
       During EDIT, existing sale quantity is
       added back before checking available stock.
    ----------------------------------------------------- */

    let availableStock =
      Number(product.stock) || 0;

    if (editingSaleId) {
      const oldSale =
        sales.find(
          (sale) =>
            sale.id ===
            editingSaleId
        );

      if (
        oldSale &&
        String(oldSale.productId) ===
          String(product.id)
      ) {
        availableStock +=
          Number(
            oldSale.quantity
          ) || 0;
      }
    }

    if (
      quantity >
      availableStock
    ) {
      alert(
        `Only ${availableStock} units are available in stock.`
      );

      return;
    }

    /* -----------------------------------------------------
       SERIAL DUPLICATE
    ----------------------------------------------------- */

    if (
      isSerialAlreadyUsed(
        form.serial,
        editingSaleId
      )
    ) {
      alert(
        "This serial number is already used in another sale."
      );

      return;
    }

    /* -----------------------------------------------------
       REMINDER DATE
    ----------------------------------------------------- */

    const calculatedReminderDate =
      addDays(
        form.saleDate,
        duration
      );

    /* -----------------------------------------------------
       SALE OBJECT
    ----------------------------------------------------- */

    const newSale = {
      id:
        editingSaleId ||
        Date.now(),

      saleDate:
        form.saleDate,

      customerName:
        form.customerName.trim(),

      mobile:
        cleanMobile,

      address:
        form.address.trim(),

      product:
        product.name,

      productId:
        product.id,

      quantity,

      serial:
        form.serial.trim(),

      duration,

      soldThrough:
        form.soldThrough,

      reminderDate:
        calculatedReminderDate,
    };

    /* -----------------------------------------------------
       UPDATE EXISTING
    ----------------------------------------------------- */

    if (editingSaleId) {
      const updatedSales =
        sales.map((sale) =>
          sale.id ===
          editingSaleId
            ? newSale
            : sale
        );

      saveSales(
        updatedSales
      );

      closeForm();

      return;
    }

    /* -----------------------------------------------------
       ADD NEW
    ----------------------------------------------------- */

    const updatedSales = [
      newSale,
      ...sales,
    ];

    saveSales(
      updatedSales
    );

    closeForm();
  };

  /* =======================================================
     DELETE SALE
  ======================================================= */

  const confirmDelete = () => {
    if (!deleteSaleId) {
      return;
    }

    const updatedSales =
      sales.filter(
        (sale) =>
          sale.id !==
          deleteSaleId
      );

    saveSales(
      updatedSales
    );

    setDeleteSaleId(null);
  };

  /* =======================================================
     SUMMARY VALUES
  ======================================================= */

  const totalQuantity =
    sales.reduce(
      (total, sale) =>
        total +
        Number(
          sale.quantity
        ),
      0
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="page-enter">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="page-header">

        <div className="page-eyebrow">
          KOMAL CUSTOMER CARE
        </div>

        <div className="products-heading-row">

          <div>

            <h1 className="page-title">
              Sales
            </h1>

            <p className="page-description">
              Manage sales, customers and
              product reminders.
            </p>

          </div>

          <button
            className="primary-button"
            onClick={openNewSale}
          >
            <Plus size={18} />
            New Sale
          </button>

        </div>

      </section>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="product-summary-grid">

        {/* TOTAL SALES */}

        <div className="summary-card">

          <div className="summary-icon">
            <ShoppingCart size={20} />
          </div>

          <div>

            <div className="summary-label">
              Total Sales
            </div>

            <div className="summary-value">
              {sales.length}
            </div>

          </div>

        </div>

        {/* TOTAL QUANTITY */}

        <div className="summary-card">

          <div className="summary-icon">
            <Package size={20} />
          </div>

          <div>

            <div className="summary-label">
              Total Quantity
            </div>

            <div className="summary-value">
              {totalQuantity}
            </div>

          </div>

        </div>

        {/* UPCOMING REMINDERS */}

        <div className="summary-card">

          <div className="summary-icon">
            <Clock3 size={20} />
          </div>

          <div>

            <div className="summary-label">
              Upcoming Reminders
            </div>

            <div className="summary-value">
              {upcomingReminders.length}
            </div>

            <small>
              Next {REMINDER_WINDOW_DAYS} days
            </small>

          </div>

        </div>

        {/* LOW STOCK */}

        <div className="summary-card">

          <div className="summary-icon">
            <AlertTriangle size={20} />
          </div>

          <div>

            <div className="summary-label">
              Low Stock
            </div>

            <div className="summary-value">
              {lowStockProducts.length}
            </div>

            <small>
              Below {LOW_STOCK_LIMIT} units
            </small>

          </div>

        </div>

      </section>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="pro-card product-toolbar">

        <div className="product-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search customer, product, mobile..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

      </div>

      {/* =================================================
          SALES TABLE
      ================================================= */}

      <div className="pro-card table-card">

        <div className="card-header">

          <div>

            <h2 className="card-title">
              Sales History
            </h2>

            <p className="card-description">
              Click any sale to view complete
              details.
            </p>

          </div>

        </div>

        <div className="table-wrapper">

          <table className="data-table">

            <thead>

              <tr>

                <th>
                  Customer
                </th>

                <th>
                  Product
                </th>

                <th>
                  Sale Date
                </th>

                <th>
                  Qty
                </th>

                <th>
                  Serial No.
                </th>

                <th>
                  Sold Through
                </th>

                <th>
                  Reminder
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredSales.map(
                (sale) => {

                  const daysLeft =
                    getDaysLeft(
                      sale.reminderDate
                    );

                  return (

                    <tr
                      key={sale.id}
                      className="clickable-row"
                      onClick={() =>
                        setSelectedSale(
                          sale
                        )
                      }
                    >

                      <td>

                        <div className="table-primary">
                          {
                            sale.customerName
                          }
                        </div>

                        <div className="table-secondary">
                          {sale.mobile}
                        </div>

                      </td>

                      <td>
                        {sale.product}
                      </td>

                      <td>
                        {formatDate(
                          sale.saleDate
                        )}
                      </td>

                      <td>
                        {sale.quantity}
                      </td>

                      <td>
                        {sale.serial ||
                          "-"}
                      </td>

                      <td>
                        {sale.soldThrough}
                      </td>

                      <td>

                        <div className="reminder-table-cell">

                          <strong>
                            {formatDate(
                              sale.reminderDate
                            )}
                          </strong>

                          <span
                            className={
                              daysLeft !== null &&
                              daysLeft >= 0 &&
                              daysLeft <=
                                REMINDER_WINDOW_DAYS
                                ? "stock-danger"
                                : daysLeft < 0
                                ? "stock-danger"
                                : "stock-warning"
                            }
                          >

                            {daysLeft === null
                              ? "-"
                              : daysLeft < 0
                              ? "Expired"
                              : daysLeft <=
                                REMINDER_WINDOW_DAYS
                              ? `${daysLeft} days left`
                              : `${daysLeft} days left`}

                          </span>

                        </div>

                      </td>

                      <td
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >

                        <div className="table-actions">

                          <button
                            className="table-action edit"
                            onClick={() =>
                              openEditSale(
                                sale
                              )
                            }
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="table-action delete"
                            onClick={() =>
                              setDeleteSaleId(
                                sale.id
                              )
                            }
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  );
                }
              )}

            </tbody>

          </table>

          {filteredSales.length === 0 && (

            <div className="empty-state">

              <ShoppingCart size={35} />

              <h3>
                No sales found
              </h3>

              <p>
                Add your first sale
                to get started.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* =================================================
          UPCOMING REMINDERS PANEL

          ONLY SHOW PANEL WHEN <= 10 DAYS
      ================================================= */}

      {upcomingReminders.length > 0 && (

        <div className="pro-card">

          <div className="card-header">

            <div>

              <h2 className="card-title">
                Upcoming Reminders
              </h2>

              <p className="card-description">
                Customers whose reminder is due
                within the next {REMINDER_WINDOW_DAYS} days.
              </p>

            </div>

            <div className="summary-icon">
              <Clock3 size={20} />
            </div>

          </div>

          <div className="low-stock-grid">

            {upcomingReminders.map(
              (sale) => {

                const daysLeft =
                  getDaysLeft(
                    sale.reminderDate
                  );

                return (

                  <div
                    className="low-stock-item"
                    key={sale.id}
                    onClick={() =>
                      setSelectedSale(
                        sale
                      )
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >

                    <div className="low-item-top">

                      <div>

                        <strong>
                          {sale.customerName}
                        </strong>

                        <span>
                          {sale.mobile}
                        </span>

                      </div>

                      <span className="low-count">

                        {daysLeft === 0
                          ? "Today"
                          : `${daysLeft} days left`}

                      </span>

                    </div>

                    <div className="low-item-bottom">

                      <span>
                        {sale.product}
                      </span>

                      <span>
                        {formatDate(
                          sale.reminderDate
                        )}
                      </span>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        </div>

      )}

      {/* =================================================
          LOW STOCK PANEL

          ONLY SHOW WHEN STOCK < 5
      ================================================= */}

      {lowStockProducts.length > 0 && (

        <div className="low-stock-panel">

          <div className="low-stock-heading">

            <div className="low-stock-heading-icon">
              <AlertTriangle size={20} />
            </div>

            <div>

              <h2>
                Low Stock Attention
              </h2>

              <p>
                Products with less than{" "}
                {LOW_STOCK_LIMIT} units
                remaining.
              </p>

            </div>

          </div>

          <div className="low-stock-grid">

            {lowStockProducts.map(
              (product) => (

                <div
                  className="low-stock-item"
                  key={product.id}
                >

                  <div className="low-item-top">

                    <div>

                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {product.brand ||
                          product.category ||
                          "Product"}
                      </span>

                    </div>

                    <span className="low-count">
                      {product.stock} left
                    </span>

                  </div>

                  <div className="low-item-bottom">

                    <span>
                      SKU:{" "}
                      {product.sku ||
                        product.code ||
                        "-"}
                    </span>

                    <span>
                      Minimum:{" "}
                      {LOW_STOCK_LIMIT}
                    </span>

                  </div>

                  <div className="stock-progress">

                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (Number(
                              product.stock
                            ) /
                              LOW_STOCK_LIMIT) *
                              100
                          )
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      )}

      {/* =================================================
          ADD / EDIT SALE MODAL
      ================================================= */}

      {showForm && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }

          }}
        >

          <div className="modal sale-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <div className="page-eyebrow">
                  SALES MANAGEMENT
                </div>

                <h2>

                  {editingSaleId
                    ? "Edit Sale"
                    : "New Sale"}

                </h2>

                <p>
                  Enter sale and customer
                  information.
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeForm}
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >

              {/* =================================================
                  SALE INFORMATION
              ================================================= */}

              <div className="form-section-title">
                Sale Information
              </div>

              <div className="form-grid">

                {/* DATE */}

                <div className="form-field">

                  <label>
                    Sale Date *
                  </label>

                  <div className="input-with-icon">

                    <CalendarDays
                      size={17}
                    />

                    <input
                      type="date"
                      name="saleDate"
                      value={
                        form.saleDate
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>

                </div>

                {/* PRODUCT */}

                <div className="form-field">

                  <label>
                    Product *
                  </label>

                  <div className="input-with-icon">

                    <Package
                      size={17}
                    />

                    <select
                      name="productId"
                      value={
                        form.productId
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select Product
                      </option>

                      {products.map(
                        (product) => (

                          <option
                            key={
                              product.id
                            }
                            value={
                              product.id
                            }
                          >

                            {product.name}

                            {" — "}

                            Stock:{" "}
                            {product.stock}

                          </option>

                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* QUANTITY */}

                <div className="form-field">

                  <label>
                    Quantity *
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={
                      form.quantity
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                  {selectedProduct && (

                    <small>

                      Available stock:{" "}
                      {
                        selectedProduct.stock
                      }

                    </small>

                  )}

                </div>

                {/* SERIAL */}

                <div className="form-field">

                  <label>

                    Serial No.

                    <span className="optional-label">
                      Optional
                    </span>

                  </label>

                  <div className="input-with-icon">

                    <Hash size={17} />

                    <input
                      type="text"
                      name="serial"
                      placeholder="Enter serial number"
                      value={
                        form.serial
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  CUSTOMER INFORMATION
              ================================================= */}

              <div className="form-section-title">
                Customer Information
              </div>

              <div className="form-grid">

                {/* CUSTOMER */}

                <div className="form-field">

                  <label>
                    Customer Name *
                  </label>

                  <div className="input-with-icon">

                    <UserRound
                      size={17}
                    />

                    <input
                      type="text"
                      name="customerName"
                      placeholder="Customer name"
                      value={
                        form.customerName
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>

                </div>

                {/* MOBILE */}

                <div className="form-field">

                  <label>
                    Mobile *
                  </label>

                  <div className="input-with-icon">

                    <Phone size={17} />

                    <input
                      type="tel"
                      name="mobile"
                      placeholder="10 digit mobile number"
                      maxLength="10"
                      value={
                        form.mobile
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>

                </div>

                {/* ADDRESS */}

                <div className="form-field form-field-full">

                  <label>
                    Address *
                  </label>

                  <div className="input-with-icon">

                    <MapPin
                      size={17}
                    />

                    <input
                      type="text"
                      name="address"
                      placeholder="Customer address"
                      value={
                        form.address
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  SERVICE & REMINDER
              ================================================= */}

              <div className="form-section-title">
                Service & Reminder
              </div>

              <div className="form-grid">

                {/* DURATION */}

                <div className="form-field">

                  <label>
                    Product Life Duration *
                  </label>

                  <div className="input-with-icon">

                    <Clock3
                      size={17}
                    />

                    <input
                      type="number"
                      name="duration"
                      min="1"
                      max="365"
                      placeholder="1 - 365 days"
                      value={
                        form.duration
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>

                  <small>
                    Reminder is calculated
                    from the sale date.
                  </small>

                </div>

                {/* STAFF */}

                <div className="form-field">

                  <label>
                    Sold Through *
                  </label>

                  <div className="input-with-icon">

                    <UserCheck
                      size={17}
                    />

                    <select
                      name="soldThrough"
                      value={
                        form.soldThrough
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >

                      <option value="">
                        Select Staff
                      </option>

                      {staffList.map(
                        (staff) => (

                          <option
                            key={staff}
                            value={staff}
                          >
                            {staff}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* REMINDER PREVIEW */}

                <div className="sale-reminder-preview">

                  <div className="sale-reminder-icon">

                    <Clock3
                      size={20}
                    />

                  </div>

                  <div>

                    <div className="sale-reminder-label">
                      Expiry / Reminder Date
                    </div>

                    <div className="sale-reminder-date">

                      {reminderDate
                        ? formatDate(
                            reminderDate
                          )
                        : "-"}

                    </div>

                    <div className="sale-reminder-help">

                      Sale Date +{" "}
                      {Number(
                        form.duration
                      ) || 0}{" "}
                      day
                      {Number(
                        form.duration
                      ) === 1
                        ? ""
                        : "s"}

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >

                  {editingSaleId
                    ? "Update Sale"
                    : "Save Sale"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =================================================
          SALE DETAILS MODAL
      ================================================= */}

      {selectedSale && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedSale(null);
            }

          }}
        >

          <div className="modal sale-details-modal">

            <div className="modal-header">

              <div>

                <div className="page-eyebrow">
                  SALE DETAILS
                </div>

                <h2>
                  {
                    selectedSale.customerName
                  }
                </h2>

                <p>
                  Complete sale information
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setSelectedSale(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="sale-details-grid">

              <div className="detail-box">

                <span>
                  Customer Name
                </span>

                <strong>
                  {
                    selectedSale.customerName
                  }
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Mobile
                </span>

                <strong>
                  {
                    selectedSale.mobile
                  }
                </strong>

              </div>

              <div className="detail-box detail-full">

                <span>
                  Address
                </span>

                <strong>
                  {
                    selectedSale.address
                  }
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Product
                </span>

                <strong>
                  {
                    selectedSale.product
                  }
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Quantity
                </span>

                <strong>
                  {
                    selectedSale.quantity
                  }
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Serial No.
                </span>

                <strong>
                  {
                    selectedSale.serial ||
                    "-"
                  }
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Sale Date
                </span>

                <strong>
                  {formatDate(
                    selectedSale.saleDate
                  )}
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Life Duration
                </span>

                <strong>
                  {
                    selectedSale.duration
                  }{" "}
                  days
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Sold Through
                </span>

                <strong>
                  {
                    selectedSale.soldThrough
                  }
                </strong>

              </div>

              <div className="detail-box reminder-detail">

                <span>
                  Expiry / Reminder Date
                </span>

                <strong>
                  {formatDate(
                    selectedSale.reminderDate
                  )}
                </strong>

                <small>

                  {(() => {

                    const daysLeft =
                      getDaysLeft(
                        selectedSale.reminderDate
                      );

                    if (
                      daysLeft === null
                    ) {
                      return "-";
                    }

                    if (
                      daysLeft < 0
                    ) {
                      return "Expired";
                    }

                    if (
                      daysLeft <=
                      REMINDER_WINDOW_DAYS
                    ) {
                      return `${daysLeft} days remaining`;
                    }

                    return `${daysLeft} days remaining`;

                  })()}

                </small>

              </div>

            </div>

            <div className="modal-footer">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSelectedSale(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => {

                  const sale =
                    selectedSale;

                  setSelectedSale(
                    null
                  );

                  openEditSale(
                    sale
                  );

                }}
              >

                <Pencil size={17} />

                Edit Sale

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteSaleId && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteSaleId(null);
            }

          }}
        >

          <div className="modal delete-modal">

            <div className="delete-icon">
              <Trash2 size={23} />
            </div>

            <h2>
              Delete Sale?
            </h2>

            <p>
              This sale entry will be
              permanently removed from
              the current data.
            </p>

            <div className="delete-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setDeleteSaleId(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={
                  confirmDelete
                }
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

