import React from 'react'
import { Helmet } from 'react-helmet'
import { Toaster } from 'react-hot-toast'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 
const Layout = ({children, title, dscription,keywords, author}) => {
  return (
    <>
    <Helmet>
        <title>{title}</title>
        <meta name="description" content={dscription} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
    </Helmet>
    <main>{children}</main>
    </>
  )
}
Layout.defaultProps = {
    title: `GIS Project`,
    dscription: `Aqua Calture`,
    keywords: `ReactJS, React Native, JavaScript, TypeScript, NodeJS, ExpressJS, React,`,
    author: `Bariflolab`
}
export default Layout
 