## 1. Ticket et diagnostic

- [x] 1.1 [T-196] Résoudre T-196, créer `infra/fix-196-monter-config-nginx-portainer-hote` depuis la branche d'intégration et exécuter le précontrôle avant modification.
- [x] 1.2 [T-196] Confirmer le décalage entre le volume `/data` du conteneur Portainer et les chemins de montage lus par le démon Docker de l'hôte.

## 2. Correction et livraison

- [x] 2.1 [T-196] Remplacer le montage relatif de `nginx.portainer.conf` par `FRONTEND_NGINX_CONFIG_FILE_PATH` et synchroniser les deux compositions Portainer.
- [x] 2.2 [T-196] Documenter la création du fichier sur l'hôte Docker, les permissions, le rafraîchissement de la stack Git et la récupération d'un ancien répertoire de montage.
- [x] 2.3 [T-196] Valider les compositions, la parité des dépôts, le registre des tickets et préparer une PR vers `develop`.
