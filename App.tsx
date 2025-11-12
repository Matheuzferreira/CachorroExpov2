import 'react-native-gesture-handler';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ImageSourcePropType } from 'react-native';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  Provider as PaperProvider, 
  DefaultTheme, 
  Button, 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator, 
  useTheme 
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// --- 1. CONFIGURAÇÃO DE TIPOS PARA NAVEGAÇÃO ---
// Tipos de Rotas (Parâmetros que cada tela pode receber)
type RootStackParamList = {
  Home: undefined; // Não recebe parâmetros
  Gallery: undefined; // Não recebe parâmetros
};

// Tipo de Propriedade de Navegação para a Home Screen
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
interface HomeProps {
  navigation: HomeScreenNavigationProp;
}

// Cria o Stack Navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// --- 2. DEFINIÇÕES GERAIS ---
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6A5ACD', 
    accent: '#E6E6FA', 
    background: '#F8F8FF', 
    text: '#4B0082', 
    error: '#B00020',
  },
};

interface DogApiData {
  message: string;
  status: string;
}

// --- 3. TELA DA GALERIA (API) ---

// GalleryScreen não precisa de props de navegação neste exemplo, mas é bom tipar por clareza.
const GalleryScreen = () => {
  const theme = useTheme(); 
  const [dogBreed, setDogBreed] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função que busca a API e extrai a raça
  const fetchDogImage = async () => {
    const apiUrl = 'https://dog.ceo/api/breeds/image/random';
    setLoading(true);

    try {
      const response = await fetch(apiUrl);
      const data: DogApiData = await response.json();
      
      if (data.status === 'success') {
        const dogLink = data.message;
        setImageUrl(dogLink);

        // Lógica de extração e formatação da raça
        const parts = dogLink.split('/');
        let breedSlug = parts[parts.length - 2]; 
        let breedName = breedSlug.replace('-', ' ');
        breedName = breedName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        setDogBreed(breedName);
      } else {
        setImageUrl(null);
        setDogBreed(null);
      }
      
    } catch (error) {
      console.error("Erro ao buscar a imagem:", error);
      setImageUrl(null);
      setDogBreed(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDogImage();
  }, []); 

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Title style={{ color: theme.colors.primary }}>Galeria de Cachorros (API)</Title>
          <Paragraph style={styles.breedText}>
            {loading ? 'Carregando Raça...' : `Raça: ${dogBreed || 'Desconhecida'}`}
          </Paragraph>
        </Card.Content>
        
        {loading ? (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, marginTop: 10 }}>Buscando a imagem...</Text>
          </View>
        ) : imageUrl ? (
          <Card.Cover 
            source={{ uri: imageUrl }} 
            style={styles.image} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
             <Paragraph style={{ color: theme.colors.error }}>Falha ao carregar a imagem.</Paragraph>
          </View>
        )}

        <Card.Actions style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={fetchDogImage} 
            loading={loading}
            icon="cached"
          >
            {loading ? 'Aguarde' : 'Novo Cachorro'}
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};


// --- 4. TELA INICIAL (Home) ---
// Usando a tipagem HomeProps que criamos
const HomeScreen = ({ navigation }: HomeProps) => (
  <View style={styles.homeContainer}>
    <Text variant="headlineMedium" style={styles.welcomeText}>
      Desafio Individual II
    </Text>
    <Text variant="bodyLarge" style={styles.subText}>
      API Dog CEO + React Native Paper + Navegação
    </Text>
    <Button
      mode="contained"
      onPress={() => navigation.navigate('Gallery')} // Ação de Navegação
      style={styles.navButton}
      icon="image-multiple"
    >
      Iniciar Galeria de Cachorros
    </Button>
    <StatusBar style="auto" />
  </View>
);


// --- 5. COMPONENTE PRINCIPAL (App) ---
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Início' }} 
          />
          <Stack.Screen 
            name="Gallery" 
            component={GalleryScreen} 
            options={{ title: 'Galeria de API' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// --- 6. ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 0, 
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  card: {
    width: '90%',
    maxWidth: 400,
    elevation: 8,
    borderRadius: 12,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 0,
  },
  breedText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  image: {
    height: 300,
    margin: 16,
    borderRadius: 8,
  },
  imagePlaceholder: {
    height: 300,
    margin: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  actions: {
    justifyContent: 'center',
    paddingBottom: 16,
  },
  welcomeText: {
    marginBottom: 10,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  subText: {
    textAlign: 'center',
    marginBottom: 30,
    color: theme.colors.text,
  },
  navButton: {
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  }
});