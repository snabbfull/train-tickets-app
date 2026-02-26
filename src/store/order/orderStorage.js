const ORDER_STORAGE_KEY = "train-tickets-order";

export function saveOrderToStorage(orderState) {
  if (!orderState) return;
  if (orderState.success) {
    try {
      localStorage.removeItem(ORDER_STORAGE_KEY);
    } catch {
      return;
    }
    return;
  }
  try {
    const toSave = {
      data: orderState.data,
      selectedSeats: orderState.selectedSeats,
      selectedSeatNumbers: orderState.selectedSeatNumbers,
      trainSummary: orderState.trainSummary,
      fpkOptions: orderState.fpkOptions,
    };
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn("orderStorage: save failed", e);
  }
}

export function loadOrderFromStorage() {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data) return null;
    return {
      data: parsed.data,
      selectedSeats: Array.isArray(parsed.selectedSeats) ? parsed.selectedSeats : [],
      selectedSeatNumbers: Array.isArray(parsed.selectedSeatNumbers) ? parsed.selectedSeatNumbers : [],
      trainSummary: parsed.trainSummary ?? null,
      fpkOptions: Array.isArray(parsed.fpkOptions) ? parsed.fpkOptions : [],
      orderNumber: null,
      loading: false,
      error: null,
      success: false,
    };
  } catch {
    return null;
  }
}
