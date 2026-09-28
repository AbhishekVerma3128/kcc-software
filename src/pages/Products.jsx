
import {
  Package,
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Layers3,
  Boxes,
  ChevronDown,
  ChevronUp,
  Tag,
  X,
  Save,
} from "lucide-react";

import { useMemo, useState } from "react";

/* =========================================================
   PRODUCT CATALOG
========================================================= */

const productCatalog = {
  Sinfin: {
    category: "Solar AC",
    productName: "Sinfin Solar AC",
    type: "variant",

    variants: [
      {
        name: "1 Ton",
        sku: "SIN-AC-1T",
        purchase: 42000,
        selling: 48000,
      },
      {
        name: "1.5 Ton",
        sku: "SIN-AC-15T",
        purchase: 47000,
        selling: 54000,
      },
      {
        name: "2 Ton",
        sku: "SIN-AC-2T",
        purchase: 56000,
        selling: 64000,
      },
    ],
  },

  DCAL: {
    category: "Accessories",
    type: "product",

    products: [
      {
        name: "Washing Ball",
        sku: "DCAL-WB-01",
        purchase: 850,
        selling: 1199,
      },
      {
        name: "Shower",
        sku: "DCAL-SH-01",
        purchase: 1200,
        selling: 1599,
      },
      {
        name: "Water Softener",
        sku: "DCAL-WS-01",
        purchase: 3500,
        selling: 4499,
      },
    ],
  },

  "Blue Mount": {
    category: "RO",
    type: "product",

    products: [
      {
        name: "Aqua Grand",
        sku: "BMR-AQ-GD",
        purchase: 8500,
        selling: 10999,
      },
      {
        name: "Prime Plus",
        sku: "BMR-PR-PL",
        purchase: 10500,
        selling: 13499,
      },
      {
        name: "Royal Pro",
        sku: "BMR-RY-PR",
        purchase: 12500,
        selling: 15999,
      },
    ],
  },
};

/* =========================================================
   INITIAL PRODUCTS
========================================================= */

const initialProducts = [
  {
    id: 1,
    brand: "Sinfin",
    category: "Solar AC",
    productName: "Sinfin Solar AC",

    variants: [
      {
        id: "sinfin-1",
        name: "1 Ton",
        sku: "SIN-AC-1T",
        purchase: 42000,
        selling: 48000,
        stock: 12,
        lowStock: 5,
      },
      {
        id: "sinfin-15",
        name: "1.5 Ton",
        sku: "SIN-AC-15T",
        purchase: 47000,
        selling: 54000,
        stock: 7,
        lowStock: 5,
      },
      {
        id: "sinfin-2",
        name: "2 Ton",
        sku: "SIN-AC-2T",
        purchase: 56000,
        selling: 64000,
        stock: 3,
        lowStock: 5,
      },
    ],
  },

  {
    id: 2,
    brand: "DCAL",
    category: "Accessories",
    productName: "DCAL",

    variants: [
      {
        id: "dcal-washing",
        name: "Washing Ball",
        sku: "DCAL-WB-01",
        purchase: 850,
        selling: 1199,
        stock: 24,
        lowStock: 5,
      },
      {
        id: "dcal-shower",
        name: "Shower",
        sku: "DCAL-SH-01",
        purchase: 1200,
        selling: 1599,
        stock: 14,
        lowStock: 5,
      },
      {
        id: "dcal-softener",
        name: "Water Softener",
        sku: "DCAL-WS-01",
        purchase: 3500,
        selling: 4499,
        stock: 4,
        lowStock: 5,
      },
    ],
  },

  {
    id: 3,
    brand: "Blue Mount",
    category: "RO",
    productName: "Blue Mount RO",

    variants: [
      {
        id: "bm-aqua",
        name: "Aqua Grand",
        sku: "BMR-AQ-GD",
        purchase: 8500,
        selling: 10999,
        stock: 9,
        lowStock: 5,
      },
      {
        id: "bm-prime",
        name: "Prime Plus",
        sku: "BMR-PR-PL",
        purchase: 10500,
        selling: 13499,
        stock: 6,
        lowStock: 5,
      },
      {
        id: "bm-royal",
        name: "Royal Pro",
        sku: "BMR-RY-PR",
        purchase: 12500,
        selling: 15999,
        stock: 2,
        lowStock: 5,
      },
    ],
  },
];

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  brand: "",
  category: "",
  productName: "",
  variantName: "",
  sku: "",
  purchase: "",
  selling: "",
  stock: "",
  lowStock: "5",
};

/* =========================================================
   SAFE HELPERS
========================================================= */

const safeString = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
};

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/* =========================================================
   NORMALIZE OLD LOCAL STORAGE DATA
========================================================= */

function normalizeProducts(rawProducts) {
  if (!Array.isArray(rawProducts)) {
    return initialProducts;
  }

  return rawProducts
    .filter(Boolean)
    .map((product, productIndex) => {
      const brand =
        safeString(product.brand, "Unknown Brand").trim();

      const category =
        safeString(product.category, "Other").trim();

      const productName =
        safeString(
          product.productName,
          brand || "Unnamed Product"
        ).trim();

      const variants = Array.isArray(product.variants)
        ? product.variants
        : [];

      return {
        id:
          product.id ??
          `product-${Date.now()}-${productIndex}`,

        brand,

        category,

        productName,

        variants: variants
          .filter(Boolean)
          .map((variant, variantIndex) => ({
            id:
              variant.id ??
              `${productIndex}-${variantIndex}-${Date.now()}`,

            name:
              safeString(
                variant.name,
                "Unnamed Variant"
              ).trim(),

            sku:
              safeString(
                variant.sku,
                `SKU-${productIndex + 1}-${variantIndex + 1}`
              )
                .trim()
                .toUpperCase(),

            purchase: safeNumber(
              variant.purchase,
              0
            ),

            selling: safeNumber(
              variant.selling,
              0
            ),

            stock: Math.max(
              0,
              safeNumber(variant.stock, 0)
            ),

            lowStock: Math.max(
              0,
              safeNumber(variant.lowStock, 5)
            ),
          })),
      };
    })
    .filter(
      (product) =>
        product.variants.length > 0
    );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Products() {
  /* =======================================================
     PRODUCTS
  ======================================================= */

  const [products, setProducts] = useState(() => {
    try {
      const saved =
        localStorage.getItem("kcc_products");

      if (!saved) {
        return initialProducts;
      }

      return normalizeProducts(
        JSON.parse(saved)
      );
    } catch {
      return initialProducts;
    }
  });

  /* =======================================================
     STATES
  ======================================================= */

  const [search, setSearch] = useState("");

  const [expanded, setExpanded] =
    useState({});

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [showModal, setShowModal] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  /* =======================================================
     SAVE TO LOCAL STORAGE
  ======================================================= */

  const saveProducts = (updatedProducts) => {
    const normalized =
      normalizeProducts(updatedProducts);

    setProducts(normalized);

    localStorage.setItem(
      "kcc_products",
      JSON.stringify(normalized)
    );

    window.dispatchEvent(
      new Event("kcc-products-updated")
    );
  };

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalVariants = products.reduce(
    (total, product) =>
      total +
      (Array.isArray(product.variants)
        ? product.variants.length
        : 0),
    0
  );

  const totalStock = products.reduce(
    (total, product) =>
      total +
      (Array.isArray(product.variants)
        ? product.variants.reduce(
            (variantTotal, variant) =>
              variantTotal +
              safeNumber(variant.stock),
            0
          )
        : 0),
    0
  );

  /* =======================================================
     LOW STOCK
     
     IMPORTANT:
     Dashboard/product page low stock is shown only
     when stock is LESS THAN 5.
  ======================================================= */

  const lowStockItems = products.flatMap(
    (product) =>
      (Array.isArray(product.variants)
        ? product.variants
        : []
      )
        .filter(
          (variant) =>
            safeNumber(variant.stock) < 5
        )
        .map((variant) => ({
          ...variant,

          brand:
            safeString(
              product.brand,
              "Unknown Brand"
            ),

          productName:
            safeString(
              product.productName,
              "Unnamed Product"
            ),
        }))
  );

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return products.filter((product) => {
      const brand =
        safeString(product.brand);

      const category =
        safeString(product.category);

      const productName =
        safeString(product.productName);

      const variants =
        Array.isArray(product.variants)
          ? product.variants
          : [];

      const matchesSearch =
        !searchText ||
        brand
          .toLowerCase()
          .includes(searchText) ||
        category
          .toLowerCase()
          .includes(searchText) ||
        productName
          .toLowerCase()
          .includes(searchText) ||
        variants.some(
          (variant) =>
            safeString(variant.name)
              .toLowerCase()
              .includes(searchText) ||
            safeString(variant.sku)
              .toLowerCase()
              .includes(searchText)
        );

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "low" &&
          variants.some(
            (variant) =>
              safeNumber(variant.stock) < 5
          ));

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    products,
    search,
    activeFilter,
  ]);

  /* =======================================================
     EXPAND / COLLAPSE
  ======================================================= */

  const toggleProduct = (id) => {
    setExpanded((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  /* =======================================================
     PRICE FORMAT
  ======================================================= */

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(
      safeNumber(price)
    );

  /* =======================================================
     OPEN ADD
  ======================================================= */

  const openAddModal = () => {
    setEditingItem(null);

    setForm({
      ...emptyForm,
    });

    setShowModal(true);
  };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEditModal = (
    product,
    variant
  ) => {
    setEditingItem({
      productId: product.id,
      variantId: variant.id,
    });

    setForm({
      brand:
        safeString(product.brand),

      category:
        safeString(product.category),

      productName:
        product.brand === "Sinfin"
          ? safeString(
              product.productName
            )
          : safeString(
              variant.name
            ),

      variantName:
        product.brand === "Sinfin"
          ? safeString(
              variant.name
            )
          : "",

      sku:
        safeString(
          variant.sku
        ),

      purchase:
        safeNumber(
          variant.purchase
        ),

      selling:
        safeNumber(
          variant.selling
        ),

      stock:
        safeNumber(
          variant.stock
        ),

      lowStock:
        safeNumber(
          variant.lowStock,
          5
        ),
    });

    setShowModal(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setShowModal(false);

    setEditingItem(null);

    setForm({
      ...emptyForm,
    });
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    /* ---------------- BRAND ---------------- */

    if (name === "brand") {
      const selectedBrand =
        productCatalog[value];

      setForm({
        ...emptyForm,

        brand: value,

        category:
          selectedBrand?.category || "",

        productName:
          selectedBrand?.type ===
          "variant"
            ? selectedBrand.productName
            : "",
      });

      return;
    }

    /* ---------------- SINFIn VARIANT ---------------- */

    if (
      name === "variantName" &&
      form.brand === "Sinfin"
    ) {
      const brandData =
        productCatalog.Sinfin;

      const selectedVariant =
        brandData.variants.find(
          (item) =>
            item.name === value
        );

      setForm((previous) => ({
        ...previous,

        variantName: value,

        sku:
          selectedVariant?.sku ||
          "",

        purchase:
          selectedVariant?.purchase ??
          "",

        selling:
          selectedVariant?.selling ??
          "",
      }));

      return;
    }

    /* ---------------- DCAL / BLUE MOUNT ---------------- */

    if (
      name === "productName" &&
      (
        form.brand === "DCAL" ||
        form.brand === "Blue Mount"
      )
    ) {
      const brandData =
        productCatalog[
          form.brand
        ];

      const selectedProduct =
        brandData?.products?.find(
          (item) =>
            item.name === value
        );

      setForm((previous) => ({
        ...previous,

        productName: value,

        variantName: value,

        sku:
          selectedProduct?.sku ||
          "",

        purchase:
          selectedProduct?.purchase ??
          "",

        selling:
          selectedProduct?.selling ??
          "",
      }));

      return;
    }

    /* ---------------- NORMAL INPUT ---------------- */

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     SKU CONFLICT CHECK
  ======================================================= */

  const skuExists = (
    sku,
    ignoreVariantId = null
  ) => {
    const normalizedSku =
      safeString(sku)
        .trim()
        .toUpperCase();

    if (!normalizedSku) {
      return false;
    }

    return products.some(
      (product) =>
        Array.isArray(
          product.variants
        ) &&
        product.variants.some(
          (variant) =>
            safeString(
              variant.sku
            )
              .trim()
              .toUpperCase() ===
              normalizedSku &&
            variant.id !==
              ignoreVariantId
        )
    );
  };

  /* =======================================================
     SAVE PRODUCT
  ======================================================= */

  const saveProduct = (event) => {
    event.preventDefault();

    const brand =
      safeString(form.brand).trim();

    const category =
      safeString(form.category).trim();

    const productName =
      safeString(
        form.productName
      ).trim();

    const variantName =
      safeString(
        form.variantName
      ).trim();

    const sku =
      safeString(form.sku)
        .trim()
        .toUpperCase();

    const purchase =
      safeNumber(form.purchase);

    const selling =
      safeNumber(form.selling);

    const stock =
      Math.max(
        0,
        safeNumber(form.stock)
      );

    const lowStock =
      Math.max(
        0,
        safeNumber(
          form.lowStock,
          5
        )
      );

    /* ---------------- REQUIRED ---------------- */

    if (!brand) {
      alert(
        "Please select a brand."
      );
      return;
    }

    if (!productName) {
      alert(
        "Please select a product."
      );
      return;
    }

    if (
      brand === "Sinfin" &&
      !variantName
    ) {
      alert(
        "Please select a variant."
      );
      return;
    }

    if (!sku) {
      alert(
        "Model No / SKU is required."
      );
      return;
    }

    /* ---------------- SKU CONFLICT ---------------- */

    if (
      skuExists(
        sku,
        editingItem?.variantId
      )
    ) {
      alert(
        `SKU "${sku}" already exists. Please use a different SKU.`
      );

      return;
    }

    /* =====================================================
       VARIANT DATA
    ===================================================== */

    const variantData = {
      id:
        editingItem?.variantId ||
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      name:
        brand === "Sinfin"
          ? variantName
          : productName,

      sku,

      purchase,

      selling,

      stock,

      lowStock,
    };

    /* =====================================================
       EDIT
    ===================================================== */

    if (editingItem) {
      const updatedProducts =
        products.map(
          (product) => {
            if (
              product.id !==
              editingItem.productId
            ) {
              return product;
            }

            return {
              ...product,

              variants:
                Array.isArray(
                  product.variants
                )
                  ? product.variants.map(
                      (variant) =>
                        variant.id ===
                        editingItem.variantId
                          ? variantData
                          : variant
                    )
                  : [
                      variantData,
                    ],
            };
          }
        );

      saveProducts(
        updatedProducts
      );

      closeModal();

      return;
    }

    /* =====================================================
       ADD NEW
    ===================================================== */

    const existingProductIndex =
      products.findIndex(
        (product) =>
          safeString(
            product.brand
          )
            .trim()
            .toLowerCase() ===
            brand.toLowerCase() &&
          safeString(
            product.productName
          )
            .trim()
            .toLowerCase() ===
            productName.toLowerCase()
      );

    let updatedProducts;

    /* Existing product */

    if (
      existingProductIndex !==
      -1
    ) {
      updatedProducts =
        products.map(
          (product, index) =>
            index ===
            existingProductIndex
              ? {
                  ...product,

                  variants: [
                    ...(Array.isArray(
                      product.variants
                    )
                      ? product.variants
                      : []),

                    variantData,
                  ],
                }
              : product
        );
    }

    /* Completely new product */

    else {
      updatedProducts = [
        ...products,

        {
          id: Date.now(),

          brand,

          category,

          productName:
            brand === "Sinfin"
              ? productName
              : brand === "DCAL"
              ? "DCAL"
              : "Blue Mount RO",

          variants: [
            variantData,
          ],
        },
      ];
    }

    saveProducts(
      updatedProducts
    );

    closeModal();
  };

  /* =======================================================
     DELETE VARIANT
  ======================================================= */

  const deleteVariant = (
    productId,
    variantId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this product variant?"
      );

    if (!confirmDelete) {
      return;
    }

    const updatedProducts =
      products
        .map((product) => {
          if (
            product.id !==
            productId
          ) {
            return product;
          }

          return {
            ...product,

            variants:
              (
                Array.isArray(
                  product.variants
                )
                  ? product.variants
                  : []
              ).filter(
                (variant) =>
                  variant.id !==
                  variantId
              ),
          };
        })
        .filter(
          (product) =>
            Array.isArray(
              product.variants
            ) &&
            product.variants.length >
              0
        );

    saveProducts(
      updatedProducts
    );
  };

  /* =======================================================
     SELECTED BRAND DATA
  ======================================================= */

  const selectedBrandData =
    form.brand
      ? productCatalog[
          form.brand
        ]
      : null;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="products-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="products-header">

        <div>

          <div className="products-eyebrow">
            KOMAL CUSTOMER CARE
          </div>

          <h1 className="products-title">
            Products & Stock
          </h1>

          <p className="products-description">
            Manage brands, models, variants,
            pricing and individual stock
            levels from one place.
          </p>

        </div>

        <button
          className="primary-product-button"
          onClick={
            openAddModal
          }
        >
          <Plus size={18} />
          Add Product
        </button>

      </div>

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="product-summary-grid">

        <div className="product-summary-card blue">

          <div className="summary-icon">
            <Layers3 size={21} />
          </div>

          <div>

            <span>
              Total Brands
            </span>

            <strong>
              {products.length}
            </strong>

            <small>
              Active brands
            </small>

          </div>

        </div>

        <div className="product-summary-card purple">

          <div className="summary-icon">
            <Package size={21} />
          </div>

          <div>

            <span>
              Total Variants
            </span>

            <strong>
              {totalVariants}
            </strong>

            <small>
              Different models / sizes
            </small>

          </div>

        </div>

        <div className="product-summary-card green">

          <div className="summary-icon">
            <Boxes size={21} />
          </div>

          <div>

            <span>
              Total Stock
            </span>

            <strong>
              {totalStock}
            </strong>

            <small>
              Units currently available
            </small>

          </div>

        </div>

        <div className="product-summary-card red">

          <div className="summary-icon">
            <AlertTriangle size={21} />
          </div>

          <div>

            <span>
              Low Stock
            </span>

            <strong>
              {lowStockItems.length}
            </strong>

            <small>
              Stock below 5 units
            </small>

          </div>

        </div>

      </div>

      {/* ===================================================
          MAIN INVENTORY
      =================================================== */}

      <div className="products-main-card">

        <div className="products-toolbar">

          <div>

            <h2>
              Product Inventory
            </h2>

            <p>
              {filteredProducts.length}{" "}
              brands ·{" "}
              {totalVariants}{" "}
              variants
            </p>

          </div>

          <div className="products-toolbar-actions">

            <div className="products-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search brand, model, SKU..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

            <button
              className={`stock-filter ${
                activeFilter === "all"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveFilter(
                  "all"
                )
              }
            >
              All
            </button>

            <button
              className={`stock-filter ${
                activeFilter === "low"
                  ? "active danger"
                  : ""
              }`}
              onClick={() =>
                setActiveFilter(
                  "low"
                )
              }
            >
              <AlertTriangle
                size={15}
              />
              Low Stock
            </button>

          </div>

        </div>

        <div className="brand-list">

          {filteredProducts.map(
            (product) => {

              const variants =
                Array.isArray(
                  product.variants
                )
                  ? product.variants
                  : [];

              const isOpen =
                expanded[
                  product.id
                ] !== false;

              const brandName =
                safeString(
                  product.brand,
                  "Unknown Brand"
                );

              const brandStock =
                variants.reduce(
                  (
                    total,
                    variant
                  ) =>
                    total +
                    safeNumber(
                      variant.stock
                    ),
                  0
                );

              const brandLowStock =
                variants.filter(
                  (variant) =>
                    safeNumber(
                      variant.stock
                    ) < 5
                ).length;

              return (
                <div
                  className="brand-card"
                  key={
                    product.id
                  }
                >

                  {/* BRAND HEADER */}

                  <div
                    className="brand-card-header"
                    onClick={() =>
                      toggleProduct(
                        product.id
                      )
                    }
                  >

                    <div className="brand-main">

                      <div className="brand-logo">

                        {brandName
                          .substring(
                            0,
                            2
                          )
                          .toUpperCase()}

                      </div>

                      <div>

                        <div className="brand-name-row">

                          <h3>
                            {safeString(
                              product.productName,
                              "Unnamed Product"
                            )}
                          </h3>

                          <span className="category-badge">
                            {safeString(
                              product.category,
                              "Other"
                            )}
                          </span>

                        </div>

                        <p>
                          {brandName} ·{" "}
                          {variants.length}{" "}
                          variants
                        </p>

                      </div>

                    </div>

                    <div className="brand-header-right">

                      <div className="brand-stock">

                        <span>
                          Total Stock
                        </span>

                        <strong>
                          {brandStock}
                        </strong>

                      </div>

                      {brandLowStock >
                        0 && (
                        <div className="brand-low-stock">
                          <AlertTriangle
                            size={14}
                          />

                          {brandLowStock}{" "}
                          Low
                        </div>
                      )}

                      <button
                        className="expand-button"
                        onClick={(event) => {
                          event.stopPropagation();

                          toggleProduct(
                            product.id
                          );
                        }}
                      >
                        {isOpen ? (
                          <ChevronUp
                            size={19}
                          />
                        ) : (
                          <ChevronDown
                            size={19}
                          />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* VARIANTS */}

                  {isOpen && (
                    <div className="variant-area">

                      <div className="variant-head">

                        <span>
                          MODEL / VARIANT
                        </span>

                        <span>
                          SKU
                        </span>

                        <span>
                          PURCHASE
                        </span>

                        <span>
                          SELLING
                        </span>

                        <span>
                          STOCK
                        </span>

                        <span>
                          STATUS
                        </span>

                        <span>
                          ACTION
                        </span>

                      </div>

                      {variants.map(
                        (variant) => {

                          const stock =
                            safeNumber(
                              variant.stock
                            );

                          /* LOW STOCK = BELOW 5 */

                          const isLow =
                            stock < 5;

                          return (
                            <div
                              className={`variant-row ${
                                isLow
                                  ? "low-stock-row"
                                  : ""
                              }`}
                              key={
                                variant.id
                              }
                            >

                              <div className="variant-product">

                                <div className="variant-icon">
                                  <Tag
                                    size={16}
                                  />
                                </div>

                                <div>

                                  <strong>
                                    {safeString(
                                      variant.name,
                                      "Unnamed Variant"
                                    )}
                                  </strong>

                                  <small>
                                    {brandName}
                                  </small>

                                </div>

                              </div>

                              <div>

                                <span className="sku-badge">
                                  {safeString(
                                    variant.sku,
                                    "NO-SKU"
                                  )}
                                </span>

                              </div>

                              <div className="price-text">

                                {formatPrice(
                                  variant.purchase
                                )}

                              </div>

                              <div className="price-text selling">

                                {formatPrice(
                                  variant.selling
                                )}

                              </div>

                              <div className="stock-number">

                                <strong>
                                  {stock}
                                </strong>

                                <span>
                                  {" "}
                                  units
                                </span>

                              </div>

                              <div>

                                {isLow ? (
                                  <span className="status-badge low">

                                    <AlertTriangle
                                      size={13}
                                    />

                                    Low Stock

                                  </span>
                                ) : (
                                  <span className="status-badge available">
                                    In Stock
                                  </span>
                                )}

                              </div>

                              <div className="variant-actions">

                                <button
                                  className="icon-action edit"
                                  title="Edit"
                                  onClick={() =>
                                    openEditModal(
                                      product,
                                      variant
                                    )
                                  }
                                >
                                  <Pencil
                                    size={15}
                                  />
                                </button>

                                <button
                                  className="icon-action delete"
                                  title="Delete"
                                  onClick={() =>
                                    deleteVariant(
                                      product.id,
                                      variant.id
                                    )
                                  }
                                >
                                  <Trash2
                                    size={15}
                                  />
                                </button>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>
              );
            }
          )}

          {filteredProducts.length ===
            0 && (
            <div className="products-empty">

              <Package
                size={42}
              />

              <h3>
                No products found
              </h3>

              <p>
                Try searching with another
                brand, model or SKU.
              </p>

            </div>
          )}

        </div>

      </div>

      {/* ===================================================
          LOW STOCK PANEL
      =================================================== */}

      <div className="low-stock-panel">

        <div className="low-stock-heading">

          <div className="low-stock-heading-icon">
            <AlertTriangle
              size={20}
            />
          </div>

          <div>

            <h2>
              Low Stock Attention
            </h2>

            <p>
              Products with less than 5 units
              remaining.
            </p>

          </div>

        </div>

        <div className="low-stock-grid">

          {lowStockItems.map(
            (item) => (

              <div
                className="low-stock-item"
                key={item.id}
              >

                <div className="low-item-top">

                  <div>

                    <strong>
                      {safeString(
                        item.productName,
                        "Unnamed Product"
                      )}
                    </strong>

                    <span>
                      {safeString(
                        item.brand,
                        "Unknown Brand"
                      )}
                    </span>

                  </div>

                  <span className="low-count">
                    {safeNumber(
                      item.stock
                    )}{" "}
                    left
                  </span>

                </div>

                <div className="low-item-bottom">

                  <span>
                    {safeString(
                      item.name,
                      "Unnamed Variant"
                    )}
                  </span>

                  <span>
                    {safeString(
                      item.sku,
                      "NO-SKU"
                    )}
                  </span>

                </div>

                <div className="stock-progress">

                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        (safeNumber(
                          item.stock
                        ) /
                          5) *
                          100
                      )}%`,
                    }}
                  />

                </div>

                <small>
                  Low stock threshold:
                  {" "}
                  5 units
                </small>

              </div>
            )
          )}

          {lowStockItems.length ===
            0 && (
            <div className="no-low-stock">
              All products have 5 or more
              units in stock.
            </div>
          )}

        </div>

      </div>

      {/* ===================================================
          ADD / EDIT MODAL
      =================================================== */}

      {showModal && (
        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="product-modal">

            <div className="product-modal-header">

              <div>

                <span className="modal-eyebrow">
                  PRODUCT MANAGEMENT
                </span>

                <h2>
                  {editingItem
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <p>
                  Select brand and product details.
                  Pricing and stock can be managed
                  individually.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={
                  closeModal
                }
                type="button"
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={
                saveProduct
              }
            >

              {/* BASIC */}

              <div className="form-section-title">
                Basic Information
              </div>

              <div className="product-form-grid">

                {/* BRAND */}

                <div className="form-field">

                  <label>
                    Brand *
                  </label>

                  <div className="select-wrapper">

                    <select
                      name="brand"
                      value={
                        form.brand
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={
                        !!editingItem
                      }
                    >

                      <option value="">
                        Select Brand
                      </option>

                      <option value="Sinfin">
                        Sinfin
                      </option>

                      <option value="DCAL">
                        DCAL
                      </option>

                      <option value="Blue Mount">
                        Blue Mount
                      </option>

                    </select>

                    <ChevronDown
                      size={17}
                    />

                  </div>

                </div>

                {/* CATEGORY */}

                <div className="form-field">

                  <label>
                    Category
                  </label>

                  <input
                    name="category"
                    value={
                      form.category
                    }
                    readOnly
                    placeholder="Category"
                  />

                </div>

                {/* SINFIn PRODUCT */}

                {form.brand ===
                  "Sinfin" && (
                  <div className="form-field full">

                    <label>
                      Product Name *
                    </label>

                    <input
                      name="productName"
                      value={
                        form.productName
                      }
                      readOnly
                    />

                  </div>
                )}

                {/* DCAL / BLUE MOUNT */}

                {(form.brand ===
                  "DCAL" ||
                  form.brand ===
                    "Blue Mount") && (
                  <div className="form-field full">

                    <label>
                      Product Name *
                    </label>

                    <div className="select-wrapper">

                      <select
                        name="productName"
                        value={
                          form.productName
                        }
                        onChange={
                          handleChange
                        }
                        required
                        disabled={
                          !!editingItem
                        }
                      >

                        <option value="">
                          Select Product
                        </option>

                        {selectedBrandData?.products?.map(
                          (product) => (
                            <option
                              key={
                                product.name
                              }
                              value={
                                product.name
                              }
                            >
                              {product.name}
                            </option>
                          )
                        )}

                      </select>

                      <ChevronDown
                        size={17}
                      />

                    </div>

                  </div>
                )}

                {/* SINFIn VARIANT */}

                {form.brand ===
                  "Sinfin" && (
                  <div className="form-field">

                    <label>
                      Variant *
                    </label>

                    <div className="select-wrapper">

                      <select
                        name="variantName"
                        value={
                          form.variantName
                        }
                        onChange={
                          handleChange
                        }
                        required
                        disabled={
                          !!editingItem
                        }
                      >

                        <option value="">
                          Select Variant
                        </option>

                        {productCatalog.Sinfin.variants.map(
                          (variant) => (
                            <option
                              key={
                                variant.name
                              }
                              value={
                                variant.name
                              }
                            >
                              {variant.name}
                            </option>
                          )
                        )}

                      </select>

                      <ChevronDown
                        size={17}
                      />

                    </div>

                  </div>
                )}

                {/* SKU */}

                <div className="form-field">

                  <label>
                    Model No / SKU *
                  </label>

                  <input
                    name="sku"
                    value={
                      form.sku
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Model / SKU"
                    required
                    readOnly={
                      form.brand ===
                        "Sinfin" ||
                      form.brand ===
                        "DCAL" ||
                      form.brand ===
                        "Blue Mount"
                    }
                  />

                  <small>
                    SKU must be unique.
                  </small>

                </div>

              </div>

              {/* PRICING */}

              <div className="form-section-title">
                Pricing & Stock
              </div>

              <div className="product-form-grid">

                {/* PURCHASE */}

                <div className="form-field">

                  <label>
                    Purchase Price *
                  </label>

                  <div className="price-input">

                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      name="purchase"
                      value={
                        form.purchase
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0"
                      required
                    />

                  </div>

                </div>

                {/* SELLING */}

                <div className="form-field">

                  <label>
                    Selling Price *
                  </label>

                  <div className="price-input">

                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      name="selling"
                      value={
                        form.selling
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0"
                      required
                    />

                  </div>

                </div>

                {/* STOCK */}

                <div className="form-field">

                  <label>
                    Current Stock *
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={
                      form.stock
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter stock quantity"
                    required
                  />

                </div>

                {/* LOW STOCK */}

                <div className="form-field">

                  <label>
                    Low Stock Alert At
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="lowStock"
                    value={
                      form.lowStock
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="5"
                  />

                  <small>
                    Dashboard alert remains
                    fixed below 5 units.
                  </small>

                </div>

              </div>

              {/* FOOTER */}

              <div className="product-modal-footer">

                <button
                  type="button"
                  className="modal-cancel"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save"
                >

                  <Save
                    size={17}
                  />

                  {editingItem
                    ? "Update Product"
                    : "Save Product"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

