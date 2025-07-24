import { speak } from 'expo-speech';
import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Switch,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Picker } from '@react-native-picker/picker';

// In a real app, you would install a library like 'react-native-vector-icons' for icons.

const Icon = ({ name, color, size = 24 }) => <View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: color+'33', justifyContent: 'center', alignItems: 'center' }}><Text style={{textAlign: 'center', fontWeight: 'bold', color: color}}>{name.charAt(0)}</Text></View>;

// New SpeakButton component for TTS
const SpeakButton = ({ textToSpeak, style, speechLanguage }) => {
    const handlePress = () => {
      speak(textToSpeak, { language: speechLanguage });
    };
    return (
        <TouchableOpacity onPress={handlePress} style={style}>
            <Icon name="VolumeUp" color="#6B7280" size={22} />
        </TouchableOpacity>
    );
};


// Mock Data
const mockUser = { name: 'Jane Doe', email: 'jane.doe@example.com' };
const mockAccounts = [
  { id: 1, name: 'Primary Checking', number: '... 4567', balance: 5250.75, type: 'checking' },
  { id: 2, name: 'High-Yield Savings', number: '... 8910', balance: 85300.21, type: 'savings' },
  { id: 3, name: 'Travel Rewards Card', number: '... 2345', balance: -750.48, type: 'credit' },
];
const mockTransactions = {
  1: [{ id: 101, date: '2024-07-15', description: 'Grocery Store', amount: -75.20, type: 'debit' }, { id: 102, date: '2024-07-14', description: 'Direct Deposit', amount: 2200.00, type: 'credit' }],
  2: [{ id: 201, date: '2024-07-11', description: 'Transfer from Checking', amount: 500.00, type: 'credit' }],
  3: [{ id: 301, date: '2024-07-10', description: 'Airline Ticket', amount: -450.00, type: 'debit' }],
};

// Reusable Components
const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>;

const BottomNavBar = ({ activeScreen, setScreen }) => {
  const navItems = [
    { id: 'dashboard', icon: 'Home', label: 'Home' },
    { id: 'accounts', icon: 'Wallet', label: 'Accounts' },
    { id: 'transfer', icon: 'ArrowLeftRight', label: 'Transfer' },
    { id: 'profile', icon: 'User', label: 'Profile' },
  ];
  return (
    <View style={styles.navBar}>
      {navItems.map(item => (
        <TouchableOpacity key={item.id} onPress={() => setScreen(item.id)} style={styles.navItem}>
          <Icon name={item.icon} color={activeScreen === item.id ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.navLabel, activeScreen === item.id && styles.navLabelActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ScreenHeader = ({ title, onBack }) => (
    <View style={styles.header}>
        {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Icon name="ArrowLeft" color="#1F2937" />
            </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        {/* Added TTS button for the header title */}
        <SpeakButton textToSpeak={title} style={styles.headerSpeakButton} />
    </View>
);

// Screens
const LoginScreen = ({ setLoggedIn, isBiometricsEnabled, setIsBiometricsEnabled }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Tts.speak('Hello, this is a test.');

  // Log out user whenever LoginScreen is rendered
  useEffect(() => {
    setLoggedIn(false);
  }, []);

  // Biometric authentication handler
  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Alert.alert('Biometric authentication not available', 'Your device does not support biometric authentication or it is not set up.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Face ID / Fingerprint',
        fallbackLabel: 'Enter Passcode',
        disableDeviceFallback: false,
      });
      if (result.success) {
        setLoggedIn(true);
      } else {
        Alert.alert('Authentication failed', 'Could not authenticate with biometrics.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during biometric authentication.');
    }
  };

  const handleLogin = () => {
    if (email == '' && password == '') {
      setLoggedIn(true);
    } else {
      Alert.alert('Invalid Credentials');
    }
  };

  return (
    <View style={styles.loginContainer}>
      <Icon name="Wallet" color="#FFFFFF" size={48} />
      <Text style={styles.loginTitle}>Welcome Back</Text>
      <Text style={styles.loginSubtitle}>Login to your account</Text>
      <TextInput placeholder="Email Address" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor="#A5B4FC" keyboardType="email-address" />
      <View style={styles.passwordContainer}>
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!passwordVisible} style={styles.input} placeholderTextColor="#A5B4FC" />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
            <Icon name={passwordVisible ? "EyeOff" : "Eye"} color="#A5B4FC" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
      
      {isBiometricsEnabled && (
        <TouchableOpacity onPress={handleBiometricAuth} style={styles.biometricButton}>
          <Icon name="FaceID" color="#A5B4FC" size={32} />
          <Text style={styles.biometricButtonText}>Login with Face ID / Fingerprint</Text>
        </TouchableOpacity>
      )}

      <View style={styles.biometricToggleContainer}>
        <Text style={styles.biometricToggleLabel}>Enable Face ID Login</Text>
        <Switch
            trackColor={{ false: "#767577", true: "#818CF8" }}
            thumbColor={isBiometricsEnabled ? "#4F46E5" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setIsBiometricsEnabled}
            value={isBiometricsEnabled}
        />
      </View>

      <Text style={styles.forgotPassword}>Forgot Password?</Text>
    </View>
  );
};

const DashboardScreen = ({ setScreen, setSelectedAccount, speechLanguage }) => {
  const totalBalance = useMemo(() => mockAccounts.reduce((sum, acc) => sum + acc.balance, 0), []);
  const formattedTotalBalance = totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  return (
    <ScrollView style={styles.screen}>
      <View style={styles.dashboardHeader}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{mockUser.name}</Text>
        </View>
      </View>
      <View style={{paddingHorizontal: 16}}>
        <Card style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <SpeakButton textToSpeak={`Total Balance: ${formattedTotalBalance} dollars`} speechLanguage={speechLanguage} />
          </View>
          <Text style={styles.balanceAmount}>${formattedTotalBalance}</Text>
        </Card>
        <Text style={styles.sectionTitle}>My Accounts</Text>
        {mockAccounts.map(account => {
            const formattedBalance = account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return (
              <TouchableOpacity key={account.id} onPress={() => { setSelectedAccount(account); setScreen('transactions'); }}>
                <Card style={styles.accountItem}>
                  <View>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountNumber}>{account.number}</Text>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={[styles.accountBalance, account.balance < 0 && styles.negativeBalance]}>${formattedBalance}</Text>
                    <Icon name="ChevronRight" color="#9CA3AF" />
                  </View>
                   <SpeakButton textToSpeak={`${account.name}. Balance: ${formattedBalance} dollars.`} style={styles.listItemSpeakButton} speechLanguage={speechLanguage} />
                </Card>
              </TouchableOpacity>
            )
        })}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {mockTransactions[1].slice(0, 3).map(tx => (
          <Card key={tx.id} style={styles.transactionItem}>
            <View>
              <Text style={styles.txDescription}>{tx.description}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, tx.type === 'credit' && styles.creditAmount]}>
              {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const AccountsScreen = ({ setScreen, setSelectedAccount, speechLanguage }) => (
    <View style={styles.screen}>
        <ScreenHeader title="My Accounts" />
        <ScrollView style={{padding: 16}}>
            {mockAccounts.map(account => (
                <TouchableOpacity key={account.id} onPress={() => { setSelectedAccount(account); setScreen('transactions'); }}>
                    <Card style={styles.accountItem}>
                        <View>
                            <Text style={styles.accountName}>{account.name}</Text>
                            <Text style={styles.accountNumber}>{account.number}</Text>
                        </View>
                        <View style={{alignItems: 'flex-end'}}>
                            <Text style={[styles.accountBalance, account.balance < 0 && styles.negativeBalance]}>${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            <Text style={styles.accountType}>{account.type} Account</Text>
                        </View>
                    </Card>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

const TransactionsScreen = ({ account, setScreen, speechLanguage }) => {
    const transactions = mockTransactions[account.id] || [];
    const formattedBalance = account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (
        <View style={styles.screen}>
            <ScreenHeader title={account.name} onBack={() => setScreen('accounts')} />
            <ScrollView style={{padding: 16}}>
                <Card>
                    <View style={styles.cardHeader}>
                        <Text style={styles.balanceLabel}>Current Balance</Text>
                         <SpeakButton textToSpeak={`Current Balance: ${formattedBalance} dollars`} speechLanguage={speechLanguage} />
                    </View>
                    <Text style={[styles.balanceAmount, {color: '#1F2937', fontSize: 30}]}>${formattedBalance}</Text>
                </Card>
                <Text style={styles.sectionTitle}>Transaction History</Text>
                {transactions.map(tx => {
                    const sign = tx.type === 'credit' ? 'Credit' : 'Debit';
                    const amount = Math.abs(tx.amount).toFixed(2);
                    return (
                        <Card key={tx.id} style={styles.transactionItem}>
                            <View>
                                <Text style={styles.txDescription}>{tx.description}</Text>
                                <Text style={styles.txDate}>{tx.date}</Text>
                            </View>
                             <View style={{alignItems: 'flex-end'}}>
                                <Text style={[styles.txAmount, tx.type === 'credit' && styles.creditAmount]}>
                                    {tx.type === 'credit' ? '+' : '-'}${amount}
                                </Text>
                                <SpeakButton textToSpeak={`${tx.description}. ${sign}: ${amount} dollars.`} speechLanguage={speechLanguage} />
                            </View>
                        </Card>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const TransferScreen = ({ setScreen, speechLanguage }) => {
    const [amount, setAmount] = useState('');
    const handleTransfer = () => {
        if (amount && parseFloat(amount) > 0) {
            Alert.alert( "Confirm Transfer", `Are you sure you want to transfer $${amount}?`,
                [ 
                    { text: "Cancel", style: "cancel" }, 
                    { text: "Confirm", onPress: () => { 
                        Alert.alert("Success", "Transfer complete!"); 
                        // Check if Tts is available before speaking
                        speak('Transfer Complete', { language: speechLanguage })
                        setScreen('dashboard'); 
                    }} 
                ]
            );
        } else { Alert.alert("Invalid Amount", "Please enter a valid amount to transfer."); }
    };

    return (
        <View style={styles.screen}>
            <ScreenHeader title="Transfer Funds" onBack={() => setScreen('dashboard')} />
            <ScrollView style={{ padding: 16 }}>
                <Card>
                    <Text style={styles.formLabel}>From</Text><Text style={styles.formValue}>{mockAccounts[0].name}</Text>
                    <Text style={styles.formLabel}>To</Text><Text style={styles.formValue}>{mockAccounts[1].name}</Text>
                    <Text style={styles.formLabel}>Amount</Text>
                    <TextInput style={styles.amountInput} placeholder="0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                </Card>
                <TouchableOpacity onPress={handleTransfer} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Review Transfer</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const ProfileScreen = ({ setLoggedIn, isBiometricsEnabled, setIsBiometricsEnabled, speechLanguage, setSpeechLanguage }) => (
    <View style={styles.screen}>
        <ScreenHeader title="Profile" />
        <ScrollView style={{padding: 16}}>
            <View style={{alignItems: 'center', paddingBottom: 20}}>
                <Image source={{ uri: `https://placehold.co/100x100/E2E8F0/4A5568?text=JD` }} style={styles.profilePic} />
                <Text style={styles.userName}>{mockUser.name}</Text>
                <Text style={styles.profileEmail}>{mockUser.email}</Text>
            </View>

            <Text style={styles.sectionTitle}>Settings</Text>
            <Card>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Enable Face ID / Biometrics</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#818CF8" }}
                        thumbColor={isBiometricsEnabled ? "#4F46E5" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={setIsBiometricsEnabled}
                        value={isBiometricsEnabled}
                    />
                </View>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Push Notifications</Text>
                    <Switch />
                </View>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Speech Language</Text>
                    <Picker
                        selectedValue={speechLanguage}
                        style={{height: 40, width: 180}}
                        onValueChange={setSpeechLanguage}
                        mode="dropdown"
                    >
                        <Picker.Item label="English" value="en-US" />
                        <Picker.Item label="Hindi" value="hi-IN" />
                        <Picker.Item label="Spanish" value="es-ES" />
                        <Picker.Item label="French" value="fr-FR" />
                        <Picker.Item label="German" value="de-DE" />
                    </Picker>
                </View>
            </Card>

            <TouchableOpacity onPress={() => setLoggedIn(false)} style={styles.logoutButton}>
                <Icon name="LogOut" color="#FFF" />
                <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
        </ScrollView>
    </View>
);

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeScreen, setScreen] = useState('dashboard');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('en-US');
  
  // Initialize TTS engine
  useEffect(() => {
    // Removed Tts initialization and cleanup
  }, []);


  function renderScreen() {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen setScreen={setScreen} setSelectedAccount={setSelectedAccount} speechLanguage={speechLanguage} />;
      case 'accounts':
        return <AccountsScreen setScreen={setScreen} setSelectedAccount={setSelectedAccount} speechLanguage={speechLanguage} />;
      case 'transactions':
        return <TransactionsScreen account={selectedAccount} setScreen={setScreen} speechLanguage={speechLanguage} />;
      case 'transfer':
        return <TransferScreen setScreen={setScreen} speechLanguage={speechLanguage} />;
      case 'profile':
        return <ProfileScreen setLoggedIn={setLoggedIn} isBiometricsEnabled={isBiometricsEnabled} setIsBiometricsEnabled={setIsBiometricsEnabled} speechLanguage={speechLanguage} setSpeechLanguage={setSpeechLanguage} />;
      default:
        return <DashboardScreen setScreen={setScreen} setSelectedAccount={setSelectedAccount} speechLanguage={speechLanguage} />;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={loggedIn ? "dark-content" : "light-content"} />
      {loggedIn ? (
        <>
          <View style={{flex: 1}}>
            {renderScreen()}
          </View>
          <BottomNavBar activeScreen={activeScreen} setScreen={setScreen} />
        </>
      ) : (
        <LoginScreen setLoggedIn={setLoggedIn} isBiometricsEnabled={isBiometricsEnabled} setIsBiometricsEnabled={setIsBiometricsEnabled} />
      )}
    </SafeAreaView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  screen: { flex: 1 },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#4338CA' },
  loginTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginTop: 16, marginBottom: 8 },
  loginSubtitle: { fontSize: 16, color: '#A5B4FC', marginBottom: 24 },
  input: { width: '100%', height: 50, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 16, color: '#FFF', marginBottom: 16 },
  passwordContainer: { width: '100%', position: 'relative', justifyContent: 'center' },
  eyeIcon: { position: 'absolute', right: 16 },
  loginButton: { width: '100%', backgroundColor: '#FFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: '#4338CA', fontWeight: 'bold', fontSize: 16 },
  biometricButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  biometricButtonText: { color: '#A5B4FC', marginLeft: 8 },
  biometricToggleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 24, paddingHorizontal: 16 },
  biometricToggleLabel: { color: '#A5B4FC' },
  forgotPassword: { color: '#A5B4FC', position: 'absolute', bottom: 40 },
  navBar: { flexDirection: 'row', height: 70, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFF' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 10, color: '#6B7280', marginTop: 4 },
  navLabelActive: { color: '#2563EB' },
  header: { height: 60, paddingHorizontal: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  headerSpeakButton: { position: 'absolute', right: 16 }, // Style for header speak button
  dashboardHeader: { padding: 16 },
  welcomeText: { color: '#6B7280' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#374151', paddingHorizontal: 16, marginTop: 24, marginBottom: 8 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, // To place speak button next to title
  balanceCard: { backgroundColor: '#2563EB' },
  balanceLabel: { color: '#D1D5DB', fontSize: 16 },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginTop: 8 },
  accountItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative' },
  listItemSpeakButton: { position: 'absolute', right: 40, top: 18 },
  accountName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  accountNumber: { color: '#6B7280', marginTop: 4 },
  accountBalance: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  negativeBalance: { color: '#DC2626' },
  accountType: { fontSize: 12, color: '#9CA3AF', textTransform: 'capitalize' },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txDescription: { fontSize: 16, fontWeight: '500', color: '#1F2937' },
  txDate: { color: '#6B7280', marginTop: 4 },
  txAmount: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  creditAmount: { color: '#16A34A' },
  profilePic: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  profileEmail: { color: '#6B7280', fontSize: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingLabel: { fontSize: 16, color: '#374151' },
  logoutButton: { backgroundColor: '#EF4444', marginVertical: 24, padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoutButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  formLabel: { color: '#6B7280', fontSize: 14, marginTop: 16 },
  formValue: { color: '#1F2937', fontSize: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  amountInput: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', paddingVertical: 8, marginTop: 16, borderBottomWidth: 2, borderBottomColor: '#2563EB' },
  primaryButton: { backgroundColor: '#2563EB', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 32 },
  primaryButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});