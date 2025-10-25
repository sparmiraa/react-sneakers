import Header from "./components/Header";
import Drawer from "./components/Drawer";
import React from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Favorite from "./pages/Favorite";
import Orders from "./pages/Orders";

const API_SNEAKERS = import.meta.env.VITE_SNICKERS_API;
const API_FAVORITE = import.meta.env.VITE_FAVORITE_API;

export const AppContext = React.createContext({});

export default function App() {
  const [items, setItems] = React.useState([]);
  const [cartItems, setCartItems] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [cartOpened, setCartOpened] = React.useState(false);
  const [favorites, setFavorites] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (cartOpened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [cartOpened]);
  

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [cartResponse, favoriteResponse, itemsResponse] = await Promise.all([
          axios.get(`${API_SNEAKERS}/cart`),
          axios.get(`${API_FAVORITE}/favorite`),
          axios.get(`${API_SNEAKERS}/items`),
        ]);
  
        setCartItems(Array.isArray(cartResponse.data) ? cartResponse.data : []);
        setFavorites(Array.isArray(favoriteResponse.data) ? favoriteResponse.data : []);
        setItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : []);
        
      } catch (error) {

        setCartItems([]);
        setFavorites([]);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }
  
    fetchData();
  }, []);
  

  const addToCart = async (obj) => {
    try {
      const findItem = cartItems.find(
        (item) => Number(item.parentId) === Number(obj.id)
      );
      if (findItem) {
        setCartItems((prev) =>
          prev.filter((item) => Number(item.parentId) !== Number(obj.id))
        );
        await axios.delete(
          `${API_SNEAKERS}/cart/${findItem.id}`
        );
      } else {
        const { data } = await axios.post(
          `${API_SNEAKERS}/cart`,
          obj
        );
        setCartItems((prev) => [...prev, data]);
      }
    } catch (error) {
      alert("Не удалось добавить товвар в корзину");
    }
  };

  const onRemoveItem = (id) => {
    axios.delete(`${API_SNEAKERS}/cart/${id}`);
    setCartItems((prev) =>
      prev.filter((item) => Number(item.id) !== Number(id))
    );
  };

  const addFavorite = async (obj) => {
    try {
      if (favorites.find((favObj) => favObj.id === obj.id)) {
        axios.delete(
          `${API_FAVORITE}/favorite/${obj.id}`
        );
        setFavorites((prev) =>
          prev.filter((item) => Number(item.id) !== Number(obj.id))
        );
      } else {
        setFavorites((prev) => [...prev, obj]);
        const { data } = await axios.post(
          `${API_FAVORITE}/favorite`,
          obj
        );
        setFavorites((prev) =>
          prev.map((item) => {
            if (item.parentId === data.parentId) {
              return {
                ...item,
                id: data.id,
              };
            }
            return item;
          })
        );
      }
    } catch (error) {}
  };

  const onChangeSearchInput = (event) => {
    setSearchValue(event.target.value);
  };

  const isItemAdded = (id) => {
    return cartItems.some((obj) => Number(obj.parentId) === Number(id));
  };

  return (
    <AppContext.Provider
      value={{
        cartItems,
        favorites,
        items,
        isItemAdded,
        setCartOpened,
        setCartItems,
        addFavorite,
        addToCart,
      }}
    >
      <div className="wrapper clear">
        <Drawer
          items={cartItems}
          onRemove={onRemoveItem}
          onCloseCart={() => setCartOpened(false)}
          opened={cartOpened}
        />

        <Header onClickCart={() => setCartOpened(true)} />

        <Routes>
          <Route
            path="/"
            element={
              <Home
                items={items}
                cartItems={cartItems}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                onChangeSearchInput={onChangeSearchInput}
                addFavorite={addFavorite}
                addToCart={addToCart}
                isLoading={isLoading}
              />
            }
          />

          <Route
            path="/favorites"
            element={<Favorite addFavorite={addFavorite} />}
          />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </div>
    </AppContext.Provider>
  );
}
