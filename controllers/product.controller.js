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
};

module.exports = productController;
