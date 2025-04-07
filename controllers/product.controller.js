const Product = require('../models/product');
const cloudinary = require('../config/cloudinary.config');

const productController = {
  // Render Product Upload Page
  productPage(req, res) {
    res.render('product/productUpload', {
      admin: req.session.admin || null,
      messages: req.flash(),
    });
  },

  // Handle Product Upload
  async productUpload(req, res) {
    try {
      if (!req.file) {
        req.flash('error', 'No file was uploaded.');
        return res.redirect('/products');
      }

      const admin = req.session.admin;
      if (!admin) {
        req.flash('error', 'Admin not authenticated.');
        return res.redirect('/adminLogin');
      }

      let productImage;
      if (process.env.USE_CLOUDINARY === 'true') {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'products',
            use_filename: true,
            unique_filename: false,
          });
          productImage = result.secure_url;
        } catch (cloudError) {
          console.error('Cloudinary Upload Error:', cloudError);
          req.flash('error', 'Failed to upload image to Cloudinary.');
          return res.redirect('/products');
        }
      } else {
        productImage = `/uploads/${req.file.filename}`;
      }

      await Product.create({
        name: req.body.productName,
        price: req.body.productPrice,
        description: req.body.productDescription,
        image: productImage,
        admin: admin._id,
      });

      req.flash('success', 'Product uploaded successfully!');
      res.redirect('/adminHome');
    } catch (error) {
      console.error('Product Upload Error:', error);
      req.flash('error', 'An error occurred while uploading the product.');
      res.redirect('/products');
    }
  },

  // Product Delete Route Controller
  async deleteProduct(req, res) {
    const { id } = req.params;

    try {
      const product = await Product.findById(id);

      if (!product) {
        req.flash('error', 'Product not found!');
        return res.redirect('/adminHome');
      }

      await Product.findByIdAndDelete(id);

      req.flash('success', 'Product deleted successfully!');
      res.redirect('/adminHome');
    } catch (error) {
      console.error('Error deleting product:', error);
      req.flash('error', 'An error occurred while deleting the product.');
      res.redirect('/adminHome');
    }
  },

  // Render the edit product page
  async editProductPage(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        req.flash('error', 'Product not found.');
        return res.redirect('/adminHome');
      }

      res.render('admin/editProduct', { product, messages: req.flash() });
    } catch (error) {
      console.error('Error fetching product for edit:', error);
      req.flash('error', 'Error loading edit page.');
      res.redirect('/adminHome');
    }
  },

  // Update product details
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, price, description } = req.body;
      let updatedProduct = { name, price, description };

      if (req.file) {
        if (process.env.USE_CLOUDINARY === 'true') {
          try {
            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
              folder: 'products',
              use_filename: true,
              unique_filename: false,
            });
            updatedProduct.image = result.secure_url;
          } catch (cloudError) {
            console.error('Cloudinary Upload Error:', cloudError);
            req.flash('error', 'Failed to upload image to Cloudinary.');
            return res.redirect(`/editProduct/${id}`);
          }
        } else {
          updatedProduct.image = `/uploads/${req.file.filename}`;
        }
      }

      await Product.findByIdAndUpdate(id, updatedProduct, { new: true });

      req.flash('success', 'Product updated successfully!');
      res.redirect('/adminHome');
    } catch (error) {
      console.error('Error updating product:', error);
      req.flash('error', 'Error updating product.');
      res.redirect(`/editProduct/${id}`);
    }
  },
};

module.exports = productController;
