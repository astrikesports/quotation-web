export const fetchStockData = async () => {

  try {

    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbxylIzt0qTShWXoA_VcepAAeZkPraEbJpj6gSNw0dJ3lcdF7doS4FUhB4xd88IR0i4/exec"
    );

    const data = await res.json();

    return data;

  } catch (err) {

    console.error("Stock fetch error:", err);
    return [];

  }

};
