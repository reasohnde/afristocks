          {activeTab === 'wallet' && (
            <View>
              <View style={styles.walletCard}>
                <Text style={styles.walletCardTitle}>Solde disponible</Text>
                <Text style={styles.walletCardBalance}>
                  {formatCurrency(user?.walletBalance || 0)}
                </Text>
                
                <View style={styles.walletActions}>
                  <TouchableOpacity style={styles.walletButton}>
                    <Text style={styles.walletButtonIcon}>↓</Text>
                    <Text style={styles.walletButtonText}>Déposer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.walletButton}>
                    <Text style={styles.walletButtonIcon}>↑</Text>
                    <Text style={styles.walletButtonText}>Retirer</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Historique des transactions</Text>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Aucune transaction récente
                </Text>
              </View>
            </View>
          )}

