import { requireAdmin, requireOwnership } from '../src/middleware/rbac.middleware';

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockImplementation(() => res);
  res.json = jest.fn().mockImplementation(() => res);
  return res;
}

describe('rbac.middleware — requireAdmin', () => {
  it('401 si non authentifié', () => {
    const req: any = {};
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('403 si rôle insuffisant (USER)', () => {
    const req: any = { user: { userId: 'u1', role: 'USER' } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('next() si ADMIN', () => {
    const req: any = { user: { userId: 'u1', role: 'ADMIN' } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('rbac.middleware — requireOwnership', () => {
  const getId = (req: any) => req.params.id;

  it('refuse l’accès aux ressources d’autrui', () => {
    const req: any = { user: { userId: 'u1', role: 'USER' }, params: { id: 'u2' } };
    const res = mockRes();
    const next = jest.fn();
    requireOwnership(getId)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('autorise le propriétaire', () => {
    const req: any = { user: { userId: 'u1', role: 'USER' }, params: { id: 'u1' } };
    const res = mockRes();
    const next = jest.fn();
    requireOwnership(getId)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('autorise un ADMIN sur n’importe quelle ressource', () => {
    const req: any = { user: { userId: 'admin', role: 'ADMIN' }, params: { id: 'u2' } };
    const res = mockRes();
    const next = jest.fn();
    requireOwnership(getId)(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
