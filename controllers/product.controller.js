const Product = require('../models/product');
const cloudinary = require('../config/cloudinary.config');

function productController() {
  return {
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
        // Check if a file is uploaded
        if (!req.file) {
          req.flash('error', 'No file was uploaded.');
          return res.redirect('/products');
        }

        // Check Admin Authentication
        const admin = req.session.admin;
        if (!admin) {
          req.flash('error', 'Admin not authenticated.');
          return res.redirect('/adminLogin');
        }

        let productImage;

        // Use Cloudinary if enabled
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

        // Create new product in database
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

    // Product Delete Controller
    async deleteProduct(req, res) {
      try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        req.flash('success', 'Product deleted successfully!');
        res.json({ success: true, message: 'Product deleted successfully!' });
      } catch (error) {
        console.error('Error deleting product:', error);
        req.flash('error', 'Error deleting product.');
        res
          .status(500)
          .json({ success: false, message: 'Error deleting product' });
      }
    },
  };
}

module.exports = productController;
