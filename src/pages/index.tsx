import type { NextPage } from 'next';
import dynamic from 'next/dynamic';

// 使用 dynamic import 确保客户端组件正确加载
const Home = dynamic(() => import('./home/page'), { ssr: false });

const indexPage: NextPage = () => {
  return <Home />;
};

export default indexPage;
