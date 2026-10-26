import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3200/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

//Login API
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login",{
    email,
    password,
  });

  return response.data;
}


// Category API 
export const getCategories = async ()=>{
  const response = await api.get("/categories");
  return response.data;
}


// Product API
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params: params });
  return response.data;
};

export const getProductById = async (productId) =>{
  const response = await api.get(`/products/${productId}`);
  return response.data;
}

//Collection API
export const getCollections = async () =>{
  const response = await api.get("/collections");
  return response.data;
}


//CART APIS

//Get the logged-in customer's cart
export const getCart = async () =>{
  const response = await api.get("/cart");
  return response.data;
};

//ADD a product to the cart
export const addToCart = async (productId, quantity = 1 )=>{
  const response = await api.post("/cart/add",{
    productId,
    quantity
  });

  return response.data;
}


//Remove a product from the Cart
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/remove/${productId}`);
  return response.data;
}

//update product quantity in the cart
export const updateCartQuantity = async (productId, quantity) =>{
  const response = await api.put(`/cart/update/${productId}`,{
    quantity,
  });

  return response.data;
}

// Address APIs
export const getAddresses = async () => {
  const response = await api.get("/addresses");
  return response.data;
};

export const addAddress = async (addressData) => {
  const response = await api.post("/addresses", addressData);
  return response.data;
};

export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(
    `/addresses/${addressId}`,
    addressData
  );

  return response.data;
}

export const deleteAddress = async (addressId) =>{
  const response = await api.delete(`/addresses/${addressId}`);
  return response.data;
};

//Order API

export const createOrder = async (addressId) => {
  const response = await api.post("/orders",{
    addressId,
    paymentMethod: "COD",
  });
  return response.data;
}



/* =========================
   BLOG APIs
========================= */

// Get published blogs (public)
export const getBlogs = async (params = {}) => {
  const response = await api.get("/blogs", { params });
  return response.data;
};

// Get one published blog by slug (public)
export const getBlogBySlug = async (slug) => {
  const response = await api.get(`/blogs/${slug}`);
  return response.data;
};

// Get all blogs for admin, including drafts
export const getAdminBlogs = async (params = {}) => {
  const response = await api.get("/blogs/admin", { params });
  return response.data;
};

// Get one blog by ID for admin
export const getAdminBlogById = async (blogId) => {
  const response = await api.get(`/blogs/admin/${blogId}`);
  return response.data;
};

// Create a blog with optional cover image
export const createBlog = async (blogData) => {
  const response = await api.post("/blogs", blogData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Update a blog with optional cover image
export const updateBlog = async (blogId, blogData) => {
  const response = await api.put(`/blogs/${blogId}`, blogData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Delete a blog
export const deleteBlog = async (blogId) => {
  const response = await api.delete(`/blogs/${blogId}`);
  return response.data;
};

// Get approved reviews for the homepage
export const getHomepageReviews = (params = {}) =>
  api.get("/reviews/homepage", { params });

export default api;