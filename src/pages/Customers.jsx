import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  Phone,
  MapPin,
  ShoppingCart,
  Package,
  Clock3,
} from "lucide-react";

const STORAGE_KEY = "kcc_customers";
const SALES_KEY = "kcc_sales";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
};

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getDaysLeft(dateString) {
  if (!dateString) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reminder = new Date(`${dateString}T00:00:00`);
  reminder.setHours(0, 0, 0, 0);

  return Math.ceil(
    (reminder - today) / (1000 * 60 * 60 * 24)
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sales, setSales] = useState(() => {
    try {
      const saved = localStorage.getItem(SALES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(customers)
    );
  }, [customers]);

  useEffect(() => {
    const loadSales = () => {
      try {
        const saved = localStorage.getItem(SALES_KEY);

        setSales(saved ? JSON.parse(saved) : []);
      } catch {
        setSales([]);
      }
    };

    loadSales();

    window.addEventListener(
      "kcc-sales-updated",
      loadSales
    );

    return () => {
      window.removeEventListener(
        "kcc-sales-updated",
        loadSales
      );
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return customers;

    return customers.filter(
      (customer) =>
        customer.name
          .toLowerCase()
          .includes(value) ||
        customer.phone.includes(value) ||
        customer.address
          .toLowerCase()
          .includes(value)
    );
  }, [customers, search]);

  /*
    Customer ki sales identify karne ke liye:

    1. New sales -> customerId
    2. Old sales -> mobile number

    Isse existing sales bhi break nahi hongi.
  */
  const getCustomerSales = (customer) => {
    return sales.filter((sale) => {
      if (
        sale.customerId &&
        sale.customerId === customer.id
      ) {
        return true;
      }

      return (
        sale.mobile?.trim() ===
        customer.phone?.trim()
      );
    });
  };

  const selectedCustomerSales = selectedCustomer
    ? getCustomerSales(selectedCustomer)
    : [];

  const totalPurchasedQuantity =
    selectedCustomerSales.reduce(
      (total, sale) =>
        total + Number(sale.quantity || 0),
      0
    );

  const activeReminders =
    selectedCustomerSales.filter(
      (sale) =>
        sale.reminderDate &&
        getDaysLeft(sale.reminderDate) >= 0
    ).length;

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(customer) {
    setEditingId(customer.id);

    setForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.phone.trim()
    ) {
      alert(
        "Customer name and mobile number are required."
      );
      return;
    }

    if (editingId) {
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === editingId
            ? {
                ...customer,
                name: form.name.trim(),
                phone: form.phone.trim(),
                address: form.address.trim(),
              }
            : customer
        )
      );

      /*
        Customer mobile change hone par old sales
        ko bhi update kar dete hain.
      */
      setSales((prev) => {
        const updatedSales = prev.map((sale) => {
          if (sale.customerId === editingId) {
            return {
              ...sale,
              customerName: form.name.trim(),
              mobile: form.phone.trim(),
              address: form.address.trim(),
            };
          }

          return sale;
        });

        localStorage.setItem(
          SALES_KEY,
          JSON.stringify(updatedSales)
        );

        window.dispatchEvent(
          new Event("kcc-sales-updated")
        );

        return updatedSales;
      });
    } else {
      const newCustomer = {
        id: Date.now(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        createdAt: new Date().toISOString(),
      };

      setCustomers((prev) => [
        newCustomer,
        ...prev,
      ]);
    }

    closeForm();
  }

  function deleteCustomer(id) {
    const customer = customers.find(
      (item) => item.id === id
    );

    if (!customer) return;

    const confirmed = window.confirm(
      `Delete customer "${customer.name}"?`
    );

    if (!confirmed) return;

    /*
      Customer delete hone par SALES delete nahi hongi.
      Sales history safe rahegi.
    */
    setCustomers((prev) =>
      prev.filter(
        (customer) => customer.id !== id
      )
    );

    if (selectedCustomer?.id === id) {
      setSelectedCustomer(null);
    }
  }

  return (
    <div className="page-enter">

      {/* HEADER */}

      <section className="page-header">

        <div className="page-eyebrow">
          CUSTOMER MANAGEMENT
        </div>

        <div className="customers-header-row">

          <div>
            <h1 className="page-title">
              Customers
            </h1>

            <p className="page-description">
              Manage your customer information and records.
            </p>
          </div>

          <button
            className="primary-action"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Customer
          </button>

        </div>

      </section>


      {/* TOOLBAR */}

      <div className="customer-toolbar">

        <div className="customer-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, mobile or address..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <div className="customer-count">

          <Users size={17} />

          <span>
            {customers.length} Customers
          </span>

        </div>

      </div>


      {/* CUSTOMER LIST */}

      <section className="customers-card">

        {filteredCustomers.length === 0 ? (

          <div className="customers-empty">

            <div className="empty-icon">
              <Users size={30} />
            </div>

            <h2>
              {search
                ? "No customers found"
                : "No customers yet"}
            </h2>

            <p>
              {search
                ? "Try another name, mobile number or address."
                : "Add your first customer to start building your customer database."}
            </p>

            {!search && (
              <button
                className="primary-action"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add First Customer
              </button>
            )}

          </div>

        ) : (

          <div className="customer-table-wrap">

            <table className="customer-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>Purchases</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredCustomers.map(
                  (customer) => {

                    const customerSales =
                      getCustomerSales(
                        customer
                      );

                    return (
                      <tr
                        key={customer.id}
                        onClick={() =>
                          setSelectedCustomer(
                            customer
                          )
                        }
                      >

                        <td>

                          <div className="customer-name-cell">

                            <div className="customer-avatar">
                              {customer.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <div className="customer-name">
                                {customer.name}
                              </div>

                              <div className="customer-small">
                                Customer #{customer.id}
                              </div>

                            </div>

                          </div>

                        </td>

                        <td>

                          <div className="table-contact">
                            <Phone size={15} />
                            {customer.phone}
                          </div>

                        </td>

                        <td>

                          <div className="table-contact">

                            <MapPin size={15} />

                            <span>
                              {customer.address ||
                                "—"}
                            </span>

                          </div>

                        </td>

                        <td>

                          <div className="customer-purchase-count">

                            <ShoppingCart size={15} />

                            {customerSales.length}

                          </div>

                        </td>

                        <td>
                          {customer.createdAt
                            ? new Date(
                                customer.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
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
                                openEditForm(
                                  customer
                                )
                              }
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="table-action delete"
                              onClick={() =>
                                deleteCustomer(
                                  customer.id
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

          </div>

        )}

      </section>


      {/* ADD / EDIT MODAL */}

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >

          <div className="customer-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p>
                  Enter customer information below.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeForm}
              >
                <X size={20} />
              </button>

            </div>


            <form
              className="customer-form"
              onSubmit={handleSubmit}
            >

              <div className="form-field">

                <label>
                  Customer Name *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  autoFocus
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  Mobile Number *
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  inputMode="numeric"
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter customer address"
                  rows="3"
                />

              </div>


              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-action"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action"
                >
                  {editingId ? (
                    <>
                      <Pencil size={17} />
                      Update Customer
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Save Customer
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* CUSTOMER DETAILS + PURCHASE HISTORY */}

      {selectedCustomer && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedCustomer(null);
            }
          }}
        >

          <div className="customer-modal customer-details-modal">

            <div className="modal-header">

              <div>

                <div className="details-avatar">
                  {selectedCustomer.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h2 className="details-title">
                  {selectedCustomer.name}
                </h2>

                <p>
                  Customer details & purchase history
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedCustomer(null)
                }
              >
                <X size={20} />
              </button>

            </div>


            {/* CUSTOMER DETAILS */}

            <div className="customer-details">

              <div className="detail-box">

                <span>
                  Mobile Number
                </span>

                <strong>
                  {selectedCustomer.phone}
                </strong>

              </div>

              <div className="detail-box">

                <span>
                  Address
                </span>

                <strong>
                  {selectedCustomer.address ||
                    "Not provided"}
                </strong>

              </div>

            </div>


            {/* PURCHASE SUMMARY */}

            <div className="customer-purchase-summary">

              <div className="customer-summary-box">

                <ShoppingCart size={19} />

                <div>
                  <span>
                    Total Purchases
                  </span>

                  <strong>
                    {selectedCustomerSales.length}
                  </strong>
                </div>

              </div>


              <div className="customer-summary-box">

                <Package size={19} />

                <div>
                  <span>
                    Total Quantity
                  </span>

                  <strong>
                    {totalPurchasedQuantity}
                  </strong>
                </div>

              </div>


              <div className="customer-summary-box">

                <Clock3 size={19} />

                <div>
                  <span>
                    Active Reminders
                  </span>

                  <strong>
                    {activeReminders}
                  </strong>
                </div>

              </div>

            </div>


            {/* PURCHASE HISTORY */}

            <div className="customer-history">

              <div className="customer-history-header">

                <div>

                  <h3>
                    Purchase History
                  </h3>

                  <p>
                    Products purchased by this customer
                  </p>

                </div>

              </div>


              {selectedCustomerSales.length === 0 ? (

                <div className="customer-no-sales">

                  <ShoppingCart size={28} />

                  <strong>
                    No purchases yet
                  </strong>

                  <span>
                    Sales for this customer will appear here.
                  </span>

                </div>

              ) : (

                <div className="customer-sales-list">

                  {selectedCustomerSales.map(
                    (sale) => {

                      const daysLeft =
                        getDaysLeft(
                          sale.reminderDate
                        );

                      return (
                        <div
                          className="customer-sale-item"
                          key={sale.id}
                        >

                          <div className="customer-sale-main">

                            <strong>
                              {sale.product}
                            </strong>

                            <span>
                              {formatDate(
                                sale.saleDate
                              )}
                            </span>

                          </div>


                          <div className="customer-sale-info">

                            <span>
                              Qty:{" "}
                              <strong>
                                {sale.quantity}
                              </strong>
                            </span>

                            <span>
                              Serial:{" "}
                              <strong>
                                {sale.serial || "-"}
                              </strong>
                            </span>

                          </div>


                          <div className="customer-sale-reminder">

                            <small>
                              Reminder
                            </small>

                            <strong>
                              {formatDate(
                                sale.reminderDate
                              )}
                            </strong>

                            {daysLeft !== null && (
                              <span
                                className={
                                  daysLeft < 0
                                    ? "stock-danger"
                                    : daysLeft <= 10
                                    ? "stock-warning"
                                    : "stock-success"
                                }
                              >
                                {daysLeft < 0
                                  ? "Expired"
                                  : `${daysLeft} days left`}
                              </span>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>


            {/* FOOTER */}

            <div className="modal-footer">

              <button
                className="secondary-action"
                onClick={() =>
                  setSelectedCustomer(null)
                }
              >
                Close
              </button>

              <button
                className="primary-action"
                onClick={() => {
                  setSelectedCustomer(null);
                  openEditForm(
                    selectedCustomer
                  );
                }}
              >
                <Pencil size={17} />
                Edit Customer
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}