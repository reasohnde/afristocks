          {activeTab === 'explore' && (
            <View>
              <TextInput
                style={styles.searchBar}
                placeholder="Rechercher une startup..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <Text style={styles.sectionTitle}>Opportunités d'investissement</Text>
              
              {filteredStartups.map((startup) => (
                <TouchableOpacity
                  key={startup.id}
                  style={styles.startupCard}
                  onPress={() => setSelectedStartup(startup)}
                >
                  <View style={styles.startupHeader}>
                    <Text style={styles.startupLogo}>{startup.logo}</Text>
                    <View style={styles.startupInfo}>
                      <Text style={styles.startupName}>{startup.name}</Text>
                      <Text style={styles.startupMeta}>
                        {startup.sector} • {startup.country}
                      </Text>
                    </View>
                    <View style={styles.growthBadge}>
                      <Text style={styles.growthText}>+{startup.growth}%</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.startupDescription} numberOfLines={2}>
                    {startup.description}
                  </Text>
                  
                  <View style={styles.startupStats}>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Prix/Action</Text>
                      <Text style={styles.statValue}>
                        {formatCurrency(startup.sharePrice)}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Min. Invest</Text>
                      <Text style={styles.statValue}>
                        {formatCurrency(startup.minInvestment)}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Disponible</Text>
                      <Text style={styles.statValue}>
                        {startup.availableShares.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

