"use client";
import * as React from "react";
import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import './cart.css';

export default function ShoppingCart() {

  //token
  const token = Cookies.get('token');
  //購物車資料
  const [shoppingcart, setshoppingcart] = useState(new Map());
  //加入購物車的數量
  const [productAmountTMP, setproductAmountTMP] = useState([]);
  //加入購物車的總額
  const [productCountTMP, setproductCountTMP] = useState([]);
  //總金額
  const [cost, setcost] = useState(0);
  //總數量
  const [total, settotal] = useState(0);
  //訂單
  const [order, setorder] = useState([]);
  //勾選
  const [checkedParent, setCheckedParent] = useState([]);
  const [checked, setChecked] = useState([]);
  //商品數量
  var count = 0;
  //API
  const ShoppingCartAPI = "/api/v1/shoppingcart/shoppingcart";
  const ProductIncreaseAPI = "/api/v1/shoppingcart/increase";
  const ProductDecreaseAPI = "/api/v1/shoppingcart/decrease";
  const ProductDeleteAPI = "/api/v1/shoppingcart/delete";
  const CreateOrderAPI = "/api/v1/order/create";

  useEffect(() => {
    async function fetchShoppingcart() {
      try {
        const view = await axios.get("/api/v1/shoppingcart/shoppingcart", {
          headers: {
            "Authorization": `Bearer ${token}` // Bearer 跟 token 中間有一個空格
          }
        });
        console.log(view.data.productShowBySeller);
        setshoppingcart(view.data.productShowBySeller);
        console.log(shoppingcart);
        let totalTMP = 0;
        let costTMP = 0;
        {
          Object.keys(view.data.productShowBySeller).map((key, index) => {
            for (let i = 0; i < view.data.productShowBySeller[key].length; i++) {
              productAmountTMP.push(view.data.productShowBySeller[key][i].amount);
              totalTMP += view.data.productShowBySeller[key][i].amount;
              productCountTMP.push(view.data.productShowBySeller[key][i].product.currentPrice * view.data.productShowBySeller[key][i].amount);
              costTMP += (view.data.productShowBySeller[key][i].product.currentPrice * view.data.productShowBySeller[key][i].amount);
              checked.push([i,true]);
            }
          })
          setcost(costTMP);
          settotal(totalTMP);
        }
        console.log(productAmountTMP);
      }
      catch (error) {
        console.error('獲取購物車資料錯誤:', error);
      }
    }
    fetchShoppingcart();
  }, []);

  //商品數量++
  function handleIncrementClick(productID, index, price) {
    const nextAmount = productAmountTMP.map((c, i) => {
      if (i === index) {
        // Increment the clicked counter
        return c + 1;
      } else {
        // The rest haven't changed
        return c;
      }
    });
    console.log(nextAmount);
    setproductAmountTMP(nextAmount);
    settotal(checked[index][1] ? total + 1 : total);

    const nextCount = productCountTMP.map((c, i) => {
      if (i === index) {
        // Increment the clicked counter
        return c + price;
      } else {
        // The rest haven't changed
        return c;
      }
    });
    console.log(nextCount);
    setproductCountTMP(nextCount);
    setcost(checked[index][1] ? cost + price : cost);

    AddProductAmount(productID);
  }

  const AddProductAmount = async (productID) => {

    const adddata = JSON.stringify({
      productId: productID,
      amount: 1,
    });

    console.log(adddata);
    try {
      let requestData = adddata;
      let API = "/api/v1/shoppingcart/increase";
      const response = await axios.post(API, requestData, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        console.log("增加成功:", response.data);
        //window.location.href = "/shopping-cart"; 
      }
    }
    catch (error) {
      console.error("新增錯誤:", error);
    }
  };

  //商品數量--
  const DecreaseProductAmount = async (productID) => {

    const decreasedata = JSON.stringify({
      productId: productID,
      amount: 1,
    });

    console.log(decreasedata);
    try {
      let requestData = decreasedata;
      let API = "/api/v1/shoppingcart/decrease";
      const response = await axios.delete(API, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Authorization": `Bearer ${token}`,
        },
        data: requestData,
      });
      if (response.status === 200) {
        console.log("減少成功:", response.data);
        //window.location.href = "/shopping-cart"; 
      }
    }
    catch (error) {
      console.error("減少錯誤:", error);
    }
  };

  function handleDecrementClick(productID, index, price) {
    const nextAmount = productAmountTMP.map((c, i) => {
      if (i === index) {
        // Increment the clicked counter
        return c - 1;
      } else {
        // The rest haven't changed
        return c;
      }
    });
    console.log(nextAmount);
    setproductAmountTMP(nextAmount);
    settotal(checked[index][1] ? total - 1 : total);

    const nextCount = productCountTMP.map((c, i) => {
      if (i === index) {
        // Increment the clicked counter
        return c - price;
      } else {
        // The rest haven't changed
        return c;
      }
    });
    console.log(nextCount);
    setproductCountTMP(nextCount);
    setcost(checked[index][1] ? cost - price : cost);

    DecreaseProductAmount(productID);
  }

  //商品byebye
  const DeleteProductAmount = async (productID) => {

    const deletedata = JSON.stringify({
      productId: productID,
      amount: 0,
    });

    console.log(deletedata);
    try {
      let requestData = deletedata;
      let API = "/api/v1/shoppingcart/delete";
      const response = await axios.delete(API, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Authorization": `Bearer ${token}`,
        },
        data: requestData,
      });
      if (response.status === 200) {
        console.log("刪除成功:", response.data);
        window.location.href = "/shopping-cart";
      }
    }
    catch (error) {
      console.error("刪除錯誤:", error);
    }
  };

  function handleDeleteClick(productID, index) {
    const nextAmount = productAmountTMP.map((c, i) => {
      if (i === index) {
        // Increment the clicked counter
        return 0;
      } else {
        // The rest haven't changed
        return c;
      }
    });
    console.log(nextAmount);
    setproductAmountTMP(nextAmount);
    settotal(checked[index][1] ? total - productAmountTMP[index] : total);

    const nextCount = productCountTMP.map((c, i) => {
      if (i === index) {
        // Increment the clicked counter
        return 0;
      } else {
        // The rest haven't changed
        return c;
      }
    });
    console.log(nextCount);
    setproductCountTMP(nextCount);
    setcost(checked[index][1] ? cost - productCountTMP[index] : cost);

    DeleteProductAmount(productID);
  }

  //送出訂單
  const CreateOrder = async () => {

    const orederdata = JSON.stringify({
      productList: order,
      amount: 0,
    });

    console.log(orederdata);
    try {
      let requestData = orederdata;
      let API = CreateOrderAPI;
      const response = await axios.post(API, requestData,
        {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Authorization": `Bearer ${token}`,
        }
      });
      if (response.status === 200) {
        console.log("下單成功:", response.data);
        setorder([]);
        window.location.href = "/my-order";
      }
    }
    catch (error) {
      setError(error.response.data.message);
      setOpenSnackbarErrror(true);
      console.error("下單錯誤:", error);
    }
  };

  function handleCreateOrderClick() {
    var tmpcount = 0;
    setorder([]);
    Object.keys(shoppingcart).map((key, index) => {
      for (let i = 0; i < shoppingcart[key].length; i++) {
        if(checked[tmpcount][1])  
         order.push([shoppingcart[key][i].product.id, shoppingcart[key][i].amount]);
        tmpcount++;
      }
    })
    console.log(order);
    CreateOrder();
  }

  //checkbox
  function handleChangeChild (event, index) {
    settotal(event.target.checked ? total + productAmountTMP[index] : total - productAmountTMP[index]);
    setcost(event.target.checked ? cost + productCountTMP[index] : cost - productCountTMP[index]);
    checked[index][1] = event.target.checked;
  };  

  //顯示訊息
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSnackbarErrror, setOpenSnackbarErrror] = useState(false); 

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setOpenSnackbarErrror(false);
  };

  //RWD
  const [br, setBr] = React.useState(true);

  React.useEffect(() => {
    window.innerWidth < 880 ? setBr(true) : setBr(false);

    function handleWindowResize() {
      window.innerWidth < 880 ? setBr(true) : setBr(false);
    }
    function handleWindowClick() {
      window.innerWidth < 880 ? setBr(true) : setBr(false);
    }

    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('click', handleWindowClick);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  return (
    <Box style={{ width:"100%", display: 'block', marginTop: "60px"}}>
      {shoppingcart ?
        <div>
          {Object.keys(shoppingcart).map((key, index) => {
            return (
              <div key={index} style={{ padding: 3, marginBottom: "20px" }}>
                <hr />
                <div className="container" >
                  <div className="item_header">
                    <div className="check"></div>
                    <div className="item_detail">賣家：{key}</div>
                    <div className="price">單價</div>
                    <div className="count">數量</div>
                    <div className="amount">總計</div>
                    <div className="operate">操作</div>
                  </div>
                  {function () {
                    let show = [];
                    console.log("check:"+ checked);
                    for (let i = 0; i < shoppingcart[key].length; i++) {
                      let countnow = count;
                      show.push(
                        <div>
                          <div className="item_header item_body">
                            <div className="check">
                              <FormControlLabel
                                control={<Checkbox color="success" checked={checked[countnow][1]} onChange={() => handleChangeChild(event, countnow)}/>}
                              />
                            </div>
                            <div className="item_detail">
                              <img src={shoppingcart[key][i].product.productImage} alt="Image" />
                              <div className="name" style={{ WebkitLineClamp: 1, overflow: "hidden", textOverflow: "ellipsis", WebkitLineClamp: 3, display: "-webkit-box", WebkitBoxOrient: "vertical", boxSizing: "border-box" }}>{shoppingcart[key][i].product.productName}</div>
                            </div>
                            <div className="price"><span>$</span>{shoppingcart[key][i].product.currentPrice}</div>
                            {function () {
                                if(shoppingcart[key][i].product.isFixedPrice){
                                  return <div className="count">
                                            <button onClick={() => productAmountTMP[countnow] > 1 ? handleDecrementClick(shoppingcart[key][i].product.id, countnow, shoppingcart[key][i].product.currentPrice) : setproductAmountTMP(productAmountTMP)}>
                                              -
                                            </button>
                                            {br ? <br/> : null}
                                            <span style={{padding:3}}> {productAmountTMP[countnow]} </span>
                                            {br ? <br/> : null}
                                            <button onClick={() => productAmountTMP[countnow] < shoppingcart[key][i].product.productAmount ? handleIncrementClick(shoppingcart[key][i].product.id, countnow, shoppingcart[key][i].product.currentPrice) : setproductAmountTMP(productAmountTMP)}>
                                              +
                                            </button>
                                          </div>
                                }
                                else{
                                  return <div className="count">
                                            <button disabled>
                                              -
                                            </button>
                                            <span style={{padding:3}}> {productAmountTMP[countnow]} </span>
                                            <button disabled>
                                              +
                                            </button>
                                          </div>
                                }
                              }()}
                            <div className="amount"><span>$</span>{productCountTMP[countnow]}</div>
                            <div className="operate">
                              <IconButton aria-label="delete" onClick={() => handleDeleteClick(shoppingcart[key][i].product.id, countnow)}>
                                <DeleteIcon />
                              </IconButton>
                            </div>
                          </div>
                        </div>
                      )
                      count += 1;
                    }
                    return show
                  }()}
                </div>
                <hr />
              </div>
            );
          })}
          <div className="container" >
            <div className="item_header" style={{ height: "40px" }}>
              <div className="check"></div>
              <div className="item_detail" style={{ display: "flex", alignItems: "center" }}>總計：</div>
              <div className="price"></div>
              <div className="count" >{total}</div>
              <div className="amount">${cost}</div>
              <div className="operate">
                {!br ? 
                <Button onClick={() => handleCreateOrderClick()} variant="contained" size="small" color="success" endIcon={<AddShoppingCartIcon />}>
                  下單
                </Button>
                :
                <Button onClick={() => handleCreateOrderClick()} size="small" color="secondary">
                  <AddShoppingCartIcon />
                </Button>
                }
              </div>
            </div>
          </div>
        </div>
        :
        <h3>去商店逛逛，把商品加入購物車吧！</h3>
      }
      <Snackbar
        open={openSnackbarErrror}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          出價成功，請重新整理頁面
        </MuiAlert>
      </Snackbar>
    </Box >
  );
}