const API_BASE_URL = "https://students.netoservices.ru/fe-diplom/";

export const fetchCities = (query) =>
  fetch(`${API_BASE_URL}routes/cities?name=${encodeURIComponent(query.toLowerCase())}`)
    .then(res => res.json());

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


export const fetchSeats = (routeId, params = {}) => {
  const searchParams = new URLSearchParams(params);
  return fetch(`${API_BASE_URL}routes/${routeId}/seats?${searchParams.toString()}`)
    .then(res => res.json());
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

export const sendOrder = (orderData) => {
  return fetch(`${API_BASE_URL}order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  }).then(res => res.json());
};

export const sendSubscribe = (email) => {
  return fetch(`${API_BASE_URL}subscribe?email=${email}`, {
    method: "POST",
  }).then((res) => res.json());
};