import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from '../../styles/pages/product';
import { GetStaticPaths, GetStaticProps } from 'next';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface ProductProps {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  description: string;
  defaultPriceId: string;
}

export default function Product({
  id,
  name,
  imageUrl,
  price,
  description,
  defaultPriceId,
}: ProductProps) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <ProductContainer>
      <ImageContainer>
        <Image src={imageUrl} width={520} height={480} alt={name} />
      </ImageContainer>

      <ProductDetails>
        <h1>{name}</h1>
        <span>{price}</span>

        <p>{description}</p>

        <button>Comprar agora</button>
      </ProductDetails>
    </ProductContainer>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Buscar os produtos mais vendidos/acessados

  return {
    paths: [{ params: { id: 'prod_PclE2yieTKx1Xd' } }],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<
  any,
  {
    id: string;
  }
> = async ({ params }) => {
  const productId = params!.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format((price.unit_amount as number) / 100),
      description: product.description || 'Sem descrição',
      defaultPriceId: price.id,
    },
    revalidate: 60 * 60 * 1, // 1 hour
  };
};
