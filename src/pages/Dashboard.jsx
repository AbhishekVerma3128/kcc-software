import { useMemo } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  Bell,
  AlertTriangle,
  ChevronRight,
  CalendarDays,
  Boxes,
} from "lucide-react";

function getDaysLeft(dateString) {
  if (!dateString) return -1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reminder = new Date(`${dateString}T00:00:00`);
  reminder.setHours(0, 0, 0, 0);

  return Math.ceil(
    (reminder - today) / (1000 * 60 * 60 * 24)
  );
}

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Date(
    `${dateString}T00:00:00`
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const sales = useMemo(() => {
    try {
      const saved = localStorage.getItem("kcc_sales");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  const products = useMemo(() => {
    try {
      const saved = localStorage.getItem("kcc_products");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  /* -----------------------------
     UPCOMING REMINDERS
     Only 0 - 10 days remaining
  ----------------------------- */

  const upcomingReminders = useMemo(() => {
    return sales
      .map((sale) => ({
        ...sale,
        daysLeft: getDaysLeft(sale.reminderDate),
      }))
      .filter(
        (sale) =>
          sale.daysLeft >= 0 &&
          sale.daysLeft <= 10
      )
      .sort(
        (a, b) =>
          a.daysLeft - b.daysLeft
      );
  }, [sales]);

  /* -----------------------------
     LOW STOCK
     Only stock less than 5
  ----------------------------- */

  const lowStockProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          Number(product.stock) < 5
      )
      .sort(
        (a, b) =>
          Number(a.stock) -
          Number(b.stock)
      );
  }, [products]);

  /* -----------------------------
     SUMMARY
  ----------------------------- */

  const totalProducts = products.length;

  const totalSales = sales.length;

  const totalQuantity = sales.reduce(
    (total, sale) =>
      total + Number(sale.quantity || 0),
    0
  );

  const totalCustomers = useMemo(() => {
    try {
      const saved =
        localStorage.getItem(
          "kcc_customers"
        );

      if (saved) {
        return JSON.parse(saved).length;
      }

      /* fallback from sales */
      return new Set(
        sales.map(
          (sale) => sale.mobile
        )
      ).size;
    } catch {
      return 0;
    }
  }, [sales]);

  return (
    <div className="dashboard-page">

      {/* =========================
          HERO
      ========================= */}

      <section className="dashboard-hero">

        <div>
          <div className="dashboard-eyebrow">
            KOMAL CUSTOMER CARE
          </div>

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back! Here's what's
            happening with your business today.
          </p>
        </div>

        <div className="dashboard-hero-decoration">
          <Boxes size={82} />
        </div>

      </section>


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <section className="dashboard-summary-grid">

        <div className="dashboard-summary-card purple">

          <div className="dashboard-summary-top">
            <div>
              <span>Total Products</span>
              <strong>
                {totalProducts}
              </strong>
            </div>

            <div className="dashboard-summary-icon">
              <Package size={21} />
            </div>
          </div>

          <p>
            Products in inventory
          </p>

        </div>


        <div className="dashboard-summary-card blue">

          <div className="dashboard-summary-top">
            <div>
              <span>Total Sales</span>
              <strong>
                {totalSales}
              </strong>
            </div>

            <div className="dashboard-summary-icon">
              <ShoppingCart size={21} />
            </div>
          </div>

          <p>
            {totalQuantity} items sold
          </p>

        </div>


        <div className="dashboard-summary-card green">

          <div className="dashboard-summary-top">
            <div>
              <span>Customers</span>
              <strong>
                {totalCustomers}
              </strong>
            </div>

            <div className="dashboard-summary-icon">
              <Users size={21} />
            </div>
          </div>

          <p>
            Registered customers
          </p>

        </div>


        <div className="dashboard-summary-card orange">

          <div className="dashboard-summary-top">
            <div>
              <span>Reminders</span>
              <strong>
                {upcomingReminders.length}
              </strong>
            </div>

            <div className="dashboard-summary-icon">
              <Bell size={21} />
            </div>
          </div>

          <p>
            Due within 10 days
          </p>

        </div>

      </section>


      {/* =========================
          MAIN DASHBOARD GRID
      ========================= */}

      <section className="dashboard-content-grid">

        {/* =====================
            UPCOMING REMINDERS
        ===================== */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Upcoming Reminders
              </h2>

              <p>
                Customers whose reminder is due
                within the next 10 days.
              </p>
            </div>

            <div className="dashboard-panel-icon reminder-icon">
              <Bell size={20} />
            </div>

          </div>


          <div className="dashboard-list">

            {upcomingReminders.length === 0 ? (

              <div className="dashboard-empty">

                <div className="dashboard-empty-icon">
                  <Bell size={23} />
                </div>

                <strong>
                  No upcoming reminders
                </strong>

                <span>
                  No customer reminder is due
                  within the next 10 days.
                </span>

              </div>

            ) : (

              upcomingReminders.map((sale) => (

                <div
                  className="dashboard-reminder-item"
                  key={sale.id}
                >

                  <div className="dashboard-reminder-info">

                    <div className="dashboard-reminder-name">
                      {sale.customerName}
                    </div>

                    <div className="dashboard-reminder-meta">
                      {sale.product}
                      {sale.serial
                        ? ` • ${sale.serial}`
                        : ""}
                    </div>

                    <div className="dashboard-reminder-date">
                      <CalendarDays size={14} />
                      Reminder{" "}
                      {formatDate(
                        sale.reminderDate
                      )}
                    </div>

                  </div>


                  <div
                    className={`dashboard-days-badge ${
                      sale.daysLeft <= 2
                        ? "urgent"
                        : "normal"
                    }`}
                  >
                    {sale.daysLeft === 0
                      ? "Today"
                      : sale.daysLeft === 1
                      ? "1 day left"
                      : `${sale.daysLeft} days left`}
                  </div>

                  <ChevronRight
                    size={17}
                    className="dashboard-chevron"
                  />

                </div>

              ))

            )}

          </div>

        </div>


        {/* =====================
            LOW STOCK
        ===================== */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Low Stock
              </h2>

              <p>
                Products with fewer than 5 units.
              </p>
            </div>

            <div className="dashboard-panel-icon stock-icon">
              <AlertTriangle size={20} />
            </div>

          </div>


          <div className="dashboard-list">

            {lowStockProducts.length === 0 ? (

              <div className="dashboard-empty">

                <div className="dashboard-empty-icon stock-empty">
                  <Package size={23} />
                </div>

                <strong>
                  Stock looks good
                </strong>

                <span>
                  No product currently has
                  less than 5 units.
                </span>

              </div>

            ) : (

              lowStockProducts.map((product) => (

                <div
                  className="dashboard-stock-item"
                  key={product.id}
                >

                  <div className="dashboard-stock-product">

                    <div className="dashboard-product-icon">
                      <Package size={17} />
                    </div>

                    <div>
                      <div className="dashboard-product-name">
                        {product.name}
                      </div>

                      <div className="dashboard-product-code">
                        {product.code || "No product code"}
                      </div>
                    </div>

                  </div>


                  <div
                    className={`dashboard-stock-badge ${
                      Number(product.stock) <= 2
                        ? "critical"
                        : "warning"
                    }`}
                  >
                    {product.stock} left
                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </section>

    </div>
  );
}