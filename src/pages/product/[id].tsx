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
import axios from 'axios';
import { useState } from 'react';

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
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] =
    useState(false);

  const { isFallback } = useRouter();

  if (isFallback) {
    return <h1>Carregando...</h1>;
  }

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true);

      const response = await axios.post('/api/checkout', {
        priceId: defaultPriceId,
      });

      const { checkoutUrl } = response.data;

      window.location.href = checkoutUrl;
    } catch (error) {
      // Conectar com uma ferramente de observabilidade (Datadog/ Sentry/ etc.)

      setIsCreatingCheckoutSession(false);

      alert('Falha ao redirecionar para o checkout!');
    }
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

        <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>
          Comprar agora
        </button>
      </ProductDetails>
    </ProductContainer>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Buscar os produtos mais vendidos/acessados

  return {
    paths: [{ params: { id: 'prod_PclE2yieTKx1Xd' } }],
    fallback: true, // 'blocking' | 'true' | 'false'
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
