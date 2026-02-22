const API_BASE_URL = "https://students.netoservices.ru/fe-diplom/";

export const fetchCities = async (query) => {
  const res = await fetch(
    `${API_BASE_URL}routes/cities?name=${encodeURIComponent(query.toLowerCase())}`
  );
  if (!res.ok) throw new Error("Ошибка загрузки городов");
  return res.json();
};

export const fetchTrainsList = async (params) => {
  const query = new URLSearchParams(params).toString();

  const response = await fetch(
    `${API_BASE_URL}routes?${query}`
  );

  if (!response.ok) {
    throw new Error("Ошибка загрузки маршрутов");
  }

  return response.json();
};


export const fetchSeats = async (routeId, params = {}) => {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(
    `${API_BASE_URL}routes/${routeId}/seats?${searchParams.toString()}`
  );
  if (!res.ok) throw new Error("Ошибка загрузки мест");
  return res.json();
};

export const fetchLastRoutes = async () => {
  const response = await fetch(
    `${API_BASE_URL}routes/last`
  );

  if (!response.ok) {
    throw new Error("Ошибка загрузки последних маршрутов");
  }

  return response.json();
};

export const sendOrder = async (orderData) => {
  const res = await fetch(`${API_BASE_URL}order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error("Ошибка оформления заказа");
  return res.json();
};

export const sendSubscribe = async (email) => {
  const res = await fetch(`${API_BASE_URL}subscribe?email=${email}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Ошибка подписки");
  return res.json();
};