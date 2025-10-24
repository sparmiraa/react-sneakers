import Info from "./Info";
import React from "react";
import { AppContext } from "../App";
import axios from "axios";


const API_SNEAKERS = import.meta.env.VITE_SNICKERS_API;
const API_FAVORITE = import.meta.env.VITE_FAVORITE_API;


const delay = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

export default function Drawer({ onRemove, onCloseCart, items = [], opened }) {
  const [isComplete, setIsComplete] = React.useState(false);
  const [orderId, setOrderId] = React.useState(null);
  const { cartItems, setCartItems } = React.useContext(AppContext);
  const [isLoading, setIsLoading] = React.useState(false);

  const totalPrice = cartItems.reduce((sum, obj) => obj.price + sum, 0)

  const onClickOrder = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        `${API_FAVORITE}/orders`,
        { items: cartItems }
      );
      setOrderId(data.id);
      setIsComplete(true);
      setCartItems([]);

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        await axios.delete(
          `${API_SNEAKERS}/cart/` + item.id
        );
        await delay();
      }
    } catch (error) {
      
    }
    setIsLoading(false);
  };
  return (
    <div className={`overlay ${opened ? 'overlayVisible' : ''}`}>
      <div className="drawer">
        <h2>
          Корзина{" "}
          <img
            onClick={onCloseCart}
            className="removeBtn"
            src="/img/btn-remove.svg"
            alt="."
          />
        </h2>

        {items.length > 0 ? (
          <div className="d-flex flex-column flex">
            <div className="items">
              {items.map((obj) => (
                <div key={obj.id} className="cartItem">
                  <div
                    style={{ backgroundImage: `url(${obj.imageUrl})` }}
                    className="cartItemImg"
                  ></div>
                  <div className="flex">
                    <p>{obj.title}</p>
                    <b>{obj.price} руб.</b>
                  </div>
                  <img
                    onClick={() => onRemove(obj.id)}
                    className="removeBtn"
                    src="/img/btn-remove.svg"
                    alt="."
                  />
                </div>
              ))}
            </div>
            <div className="cartTotalBlock">
              <ul>
                <li>
                  <span>Итого:</span>
                  <div></div>
                  <b>{totalPrice} руб.</b>
                </li>
                <li>
                  <span>Налог 5%:</span>
                  <div></div>
                  <b>{totalPrice / 100 * 5} руб.</b>
                </li>
              </ul>
              <button
                disabled={isLoading}
                onClick={onClickOrder}
                className="greenButton"
              >
                Оформить заказ <img src="/img/arrow.svg" alt="." />
              </button>
            </div>
          </div>
        ) : (
          <Info
            title={isComplete ? "Заказ оформлен!" : "Корзина пустая"}
            description={
              isComplete
                ? `Ваш заказ №${orderId} передан курьерской службе доставке`
                : "Добавьте хотябы одну пару кроссовок, чтобы сделать заказ."
            }
            image={
              isComplete ? "/img/complete-order.jpg" : "/img/empty-cart.jpg"
            }
          />
        )}
      </div>
    </div>
  );
}
